import Booking from "../models/Booking.js";
import moment from "moment";
import CryptoJS from "crypto-js";
import crypto from "crypto";
import { stringify } from "qs";
import configZalopay from "../config/configZalopay.js";
import configVnpay from "../config/configVnpay.js";
import axios from "axios";
import { sendPaymentConfirmationEmail } from "../utils/sendEmail.js";
import BookingHotel from "../models/BookingHotel.js";

export const paymentZalopay = async (orderId, type) => {
  const embed_data = {
    redirecturl: "http://localhost:3000/thankyou",
    type: type,
  };
  let orderInfo;
  if (type === "hotel") {
    orderInfo = await BookingHotel.findById(orderId);
    if (!orderInfo) {
      throw new Error("Order room not found");
    }
  }

  if (type === "tour") {
    orderInfo = await Booking.findById(orderId);
    if (!orderInfo) {
      throw new Error("Order not found");
    }
  }
  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: configZalopay.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
    app_user: orderInfo._id,
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: orderInfo.totalPrice,
    description: `Payment for the order #${transID}`,
    bank_code: "",
    callback_url:
      "https://741b-2402-800-63a3-f0fc-c095-53dc-8c36-2b34.ngrok-free.app/api/v1/bookings/callback",
  };

  const data =
    configZalopay.app_id +
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
  order.mac = CryptoJS.HmacSHA256(data, configZalopay.key1).toString();

  try {
    const result = await axios.post(configZalopay.endpoint, null, {
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

    let mac = CryptoJS.HmacSHA256(dataStr, configZalopay.key2).toString();
    console.log("mac =", mac);

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_cosde = -1;
      result.return_message = "mac not equal";
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, configZalopay.key2);
      const { type } = JSON.parse(dataJson.embed_data);
      let booking;
      console.log(type)
      if (type === "hotel") {
        booking = await BookingHotel.findOneAndUpdate(
          { _id: dataJson["app_user"] },
          { isPayment: true },
          { new: true }
        );
      } else if (type === "tour") {
        booking = await Booking.findOneAndUpdate(
          { _id: dataJson["app_user"] },
          { isPayment: true },
          { new: true }
        );
        try {
          await sendPaymentConfirmationEmail(booking.userEmail, {
            tourName: booking.tourName,
            fullName: booking.fullName,
            guestSize: booking.guestSize,
            totalPrice: booking.totalPrice,
            bookAt: booking.bookAt,
          });
        } catch (emailError) {
          console.error(
            "Failed to send email confirmation:",
            emailError.message
          );
        }
      }
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );
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

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

export const paymentVnpay = async (idOrder, type, req, res) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let orderInfo;
  if (type === "hotel") {
    orderInfo = await BookingHotel.findById(idOrder);
    if (!orderInfo) {
      throw new Error("Order room not found");
    }
  }

  if (type === "tour") {
    orderInfo = await Booking.findById(idOrder);
    if (!orderInfo) {
      throw new Error("Order not found");
    }
  }

  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");

  // Sử dụng `req` để lấy IP
  const ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  const tmnCode = configVnpay.vnp_TmnCode;
  const secretKey = configVnpay.vnp_HashSecret;
  const returnUrl = configVnpay.vnp_ReturnUrl;
  const vnpUrl = configVnpay.vnp_Url;
  const orderId = moment(date).format("DDHHmmss");
  const amount = orderInfo.totalPrice;
  const bankCode = req.body.bankCode || "";
  const locale = "vn";
  const currCode = "VND";

  // Thay đổi const thành let để có thể gán lại vnp_Params
  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: idOrder,
    vnp_OrderInfo: `Thanh toan cho ma GD: ${orderId}`,
    vnp_OrderType: type,
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  // Sắp xếp lại vnp_Params
  vnp_Params = sortObject(vnp_Params);

  let signData = stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl = `${vnpUrl}?${stringify(vnp_Params, { encode: false })}`;
  // Redirect người dùng tới paymentUrl
  return paymentUrl;
};

export const vnpayReturn = async (req, res, next) => {
  let vnp_Params = req.query;

  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params); // Hàm sortObject cần được định nghĩa hoặc import

  let tmnCode = configVnpay.vnp_TmnCode;
  let secretKey = configVnpay.vnp_HashSecret;

  // Chuẩn bị chuỗi cần ký và tạo chữ ký
  let signData = stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  // Kiểm tra chữ ký của VNPAY
  if (secureHash === signed) {
    const orderId = vnp_Params["vnp_TxnRef"];
    const rspCode = vnp_Params["vnp_ResponseCode"];

    // Kiểm tra dữ liệu trong DB hoặc các bước xử lý khác ở đây
    if (rspCode === "00") {
      // Thành công
      let orderInfo;
      orderInfo = await BookingHotel.findById(orderId);
      if (orderInfo && orderInfo.typeBooking === "hotel") {
        orderInfo.isPayment = true;
        await orderInfo.save();
        return res.redirect("http://localhost:3000/thankyou");
      }

      orderInfo = await Booking.findById(orderId);
      if (orderInfo && orderInfo.typeBooking === "tour") {
        orderInfo.isPayment = true;
        await orderInfo.save();
        await sendPaymentConfirmationEmail(orderInfo.userEmail, {
          tourName: orderInfo.tourName,
          fullName: orderInfo.fullName,
          guestSize: orderInfo.guestSize,
          totalPrice: orderInfo.totalPrice,
          bookAt: orderInfo.bookAt,
        });
        return res.redirect("http://localhost:3000/thankyou");
      }

      return res.status(404).json({ message: "Order not found" });
    } else {
      // Thanh toán thất bại, có thể gửi thông báo lỗi hoặc quay lại trang thông báo
      res.render("payment_failed", {
        message: "Payment failed, please try again.",
      });
    }
  } else {
    // Nếu chữ ký không hợp lệ, thông báo lỗi
    return res.render("error", { code: "97" });
  }
};
