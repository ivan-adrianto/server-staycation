const Category = require("../models/Category");
const Bank = require("../models/Bank");
const fs = require('fs-extra')
const path = require('path')

module.exports = {
  viewDashboard: (req, res) => {
    res.render("admin/dashboard/view_dashboard", {
      title: "Staycation - Dashboard",
    });
  },
  viewCategory: async (req, res) => {
    try {
      const category = await Category.find();
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      res.render("admin/category/view_category", {
        category,
        alert,
        title: "Staycation - Category",
      });
    } catch (err) {
      res.redirect("/admin/category");
    }
  },
  addCategory: async (req, res) => {
    try {
      const { name } = req.body;
      await Category.create({ name });
      req.flash("alertMessage", "Success Add Category");
      req.flash("alertStatus", "success");
      res.redirect("/admin/category");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/category");
    }
  },
  editCategory: async (req, res) => {
    try {
      const { id, name } = req.body;
      const category = await Category.findOne({ _id: id });
      category.name = name;
      await category.save();
      req.flash("alertMessage", "Success Edit Category");
      req.flash("alertStatus", "success");
      res.redirect("/admin/category");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findOne({ _id: id });
      await category.remove();
      req.flash("alertMessage", "Success Delete Category");
      req.flash("alertStatus", "success");
      res.redirect("/admin/category");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
    }
  },

  viewBank: async (req, res) => {
    try {
      const bank = await Bank.find();
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      res.render("admin/bank/view_bank", {
        title: "Staycation - Bank",
        bank,
        alert,
      });
    } catch (err) {
      res.redirect("/admin/category");
    }
  },
  addBank: async (req, res) => {
    try {
      const { name, account, bank } = req.body;
      console.log(`req.file`, req.file);
      await Bank.create({
        nameBank: bank,
        nomorRekening: account,
        name,
        imageUrl: `images/${req.file.filename}`,
      });
      req.flash("alertMessage", "Success Add Bank");
      req.flash("alertStatus", "success");
      res.redirect("/admin/bank");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/bank");
    }
  },
  editBank: async (req, res) => {
    try {
      const { id, name, nomorRekening, bankName } = req.body;
      const bank = await Bank.findOne({ _id: id });
      if (req.file === undefined) {
        bank.name = name;
        bank.nomorRekening = nomorRekening,
        bank.nameBank = bankName
        await bank.save();
      }  else {
        await fs.unlink(path.join(`public/${bank.imageUrl}`))
        bank.name = name;
        bank.nomorRekening = nomorRekening,
        bank.nameBank = bankName
        bank.imageUrl = `images/${req.file.filename}`
        await bank.save();
      }
      req.flash("alertMessage", "Success Edit Bank");
      req.flash("alertStatus", "success");
      res.redirect("/admin/bank");
    } catch (err) {
      console.log(`req.body`, req.body)
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/bank");
    }
  },
  deleteBank: async (req, res) => {
    try {
      const { id } = req.params;
      const bank = await Bank.findOne({ _id: id });
      await fs.unlink(path.join(`public/${bank.imageUrl}`))
      await bank.remove();
      req.flash("alertMessage", "Success Delete Bank");
      req.flash("alertStatus", "success");
      res.redirect("/admin/bank");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
    }
  },

  viewItem: (req, res) => {
    res.render("admin/item/view_item", {
      title: "Staycation - Item",
    });
  },
  viewBooking: (req, res) => {
    res.render("admin/booking/view_booking", {
      title: "Staycation - Booking",
    });
  },
};
