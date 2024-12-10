import Booking from "../models/Booking.js";
import moment from "moment";
import CryptoJS from "crypto-js";
import configPayment from "../config/configPayment.js";
import axios from "axios";
import { sendPaymentConfirmationEmail } from "../utils/sendEmail.js";

// Create new booking
export const createBooking = async (req, res) => {
  const newBooking = new Booking(req.body);

  try {
    const savedBooking = await newBooking.save();

    const paymentUrl = await payment(savedBooking._id);
    if (!paymentUrl) {
      return res.status(503).json({
        success: false,
        message: "Payment creation failed.",
      });
    }

    // Trả về URL để frontend xử lý việc chuyển hướng
    res.status(200).json({
      success: true,
      message: "Booking created successfully",
      tour: savedBooking,
      paymentUrl: paymentUrl,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      // message: err.message,
      message: "Thông tin nhập vào đang bị sai",
    });
  }
};

// Update a booking
export const updateBooking = async (req, res) => {
  const id = req.params.id;

  try {
    const updateBooking = await Booking.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Sussessfully updated the booking",
      data: updateBooking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed update a booking. Try again",
    });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  const id = req.params.id;

  try {
    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Sussessfully delete the booking",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed delete a booking. Try again",
    });
  }
};

// Get single bookings
export const getBooking = async (req, res) => {
  const id = req.params.id;

  try {
    const book = await Booking.findById(id);

    res.status(200).json({
      success: true,
      message: "Get booking successfully",
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Get booking failed. Not found booking",
    });
  }
};

// Get all bookings
export const getAllBooking = async (req, res) => {
  try {
    const bookAll = await Booking.find();

    res.status(200).json({
      success: true,
      message: "Get booking successfully",
      count: bookAll.length,
      data: bookAll,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Get all booking failed. Not found booking",
    });
  }
};

// Get bookings by userId
export const getUserBookings = async (req, res) => {
  try {
    // Lọc bookings dựa trên userId trùng với _id người dùng đã đăng nhập
    const bookings = await Booking.find({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: "Get booking history successfully",
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking history",
      error: err.message,
    });
  }
};

export const payment = async (orderId) => {
  const embed_data = {
    redirecturl: "http://localhost:3000/thankyou",
  };

  const orderInfo = await Booking.findById(orderId);
  if (!orderInfo) {
    throw new Error("Order not found");
  }

  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: configPayment.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
    app_user: orderInfo._id,
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: orderInfo.totalPrice,
    description: `Payment for the order #${transID}`,
    bank_code: "",
    callback_url:
      "https://6316-2001-ee0-4f0c-13e0-f007-235b-9eb6-f19a.ngrok-free.app/api/v1/bookings/callback",
  };

  const data =
    configPayment.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, configPayment.key1).toString();

  try {
    const result = await axios.post(configPayment.endpoint, null, {
      params: order,
    });

    if (result.data && result.data.order_url) {
      return result.data.order_url; // Return the payment URL
    } else {
      throw new Error("Payment service did not return an order URL");
    }
  } catch (error) {
    console.error("Payment Error:", error.message);
    throw new Error("Failed to process payment");
  }
};

export const callback = async (req, res) => {
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, configPayment.key2).toString();
    console.log("mac =", mac);

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_cosde = -1;
      result.return_message = "mac not equal";
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, configPayment.key2);

      const booking = await Booking.findOneAndUpdate(
        { _id: dataJson["app_user"] },
        { isPayment: true },
        { new: true }
      );
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      if (booking) {
        try {
          await sendPaymentConfirmationEmail(booking.userEmail, {
            tourName: booking.tourName,
            fullName: booking.fullName,
            guestSize: booking.guestSize,
            totalPrice: booking.totalPrice,
            bookAt: booking.bookAt,
          });
        } catch (emailError) {
          console.error("Failed to send email confirmation:", emailError.message);
        }
      }

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);
};
