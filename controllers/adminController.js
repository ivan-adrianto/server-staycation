const Category = require('../models/Category')
const Bank = require('../models/Bank')
const Item = require('../models/Item')
const Image = require('../models/Image')
const Feature = require('../models/Feature')
const Activity = require('../models/Activity')
const Booking = require('../models/Booking')
const Users = require('../models/Users')
const Member = require('../models/Member')
const fs = require('fs-extra')
const path = require('path')
const bcrypt = require('bcryptjs')

module.exports = {
  viewSignIn: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      console.log(`req.session.user`, req.session.user)
      if (req.session.user === null || req.session.user === undefined) {
        res.render('index', {
          alert,
          title: 'Staycation - Login'
        })
      } else {
        res.redirect('/admin/dashboard')
      }
    } catch (err) {
      res.redirect('/admin/signin')
    }
  },
  actionSignin: async (req, res) => {
    try {
      const { username, password } = req.body
      const users = await Users.findOne({ username })
      if (!users) {
        req.flash('alertMessage', `User tidak ditemukan}`)
        req.flash('alertStatus', 'danger')
        res.redirect('/admin/signin')
      }
      const isPasswordMatch = await bcrypt.compare(password, users.password)
      if (!isPasswordMatch) {
        req.flash('alertMessage', `Password yg anda masukkan salah`)
        req.flash('alertStatus', 'danger')
        res.redirect('/admin/signin')
      }
      req.session.user = {
        id: users.id,
        username: users.username
      }
      res.redirect('/admin/dashboard')
    } catch (error) {
      res.redirect('/admin/signin')
    }
  },
  actionLogout: async (req, res) => {
    req.session.destroy()
    res.redirect('/admin/signin')
  },

  viewDashboard: async(req, res) => {
    const member = await Member.find()
    const item = await Item.find()
    res.render('admin/dashboard/view_dashboard', {
      title: 'Staycation - Dashboard',
      member,
      item
    })
  },
  viewCategory: async (req, res) => {
    try {
      const category = await Category.find()
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/category/view_category', {
        category,
        alert,
        title: 'Staycation - Category'
      })
    } catch (err) {
      res.redirect('/admin/category')
    }
  },
  addCategory: async (req, res) => {
    try {
      const { name } = req.body
      await Category.create({ name })
      req.flash('alertMessage', 'Success Add Category')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/category')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/category')
    }
  },
  editCategory: async (req, res) => {
    try {
      const { id, name } = req.body
      const category = await Category.findOne({ _id: id })
      category.name = name
      await category.save()
      req.flash('alertMessage', 'Success Edit Category')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/category')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params
      const category = await Category.findOne({ _id: id })
      await category.remove()
      req.flash('alertMessage', 'Success Delete Category')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/category')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
    }
  },

  viewBank: async (req, res) => {
    try {
      const bank = await Bank.find()
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/bank/view_bank', {
        title: 'Staycation - Bank',
        bank,
        alert
      })
    } catch (err) {
      res.redirect('/admin/category')
    }
  },
  addBank: async (req, res) => {
    try {
      const { name, account, bank } = req.body
      await Bank.create({
        nameBank: bank,
        nomorRekening: account,
        name,
        imageUrl: `images/${req.file.filename}`
      })
      req.flash('alertMessage', 'Success Add Bank')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/bank')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/bank')
    }
  },
  editBank: async (req, res) => {
    try {
      const { id, name, nomorRekening, bankName } = req.body
      const bank = await Bank.findOne({ _id: id })
      if (req.file === undefined) {
        bank.name = name
        ;(bank.nomorRekening = nomorRekening), (bank.nameBank = bankName)
        await bank.save()
      } else {
        await fs.unlink(path.join(`public/${bank.imageUrl}`))
        bank.name = name
        ;(bank.nomorRekening = nomorRekening), (bank.nameBank = bankName)
        bank.imageUrl = `images/${req.file.filename}`
        await bank.save()
      }
      req.flash('alertMessage', 'Success Edit Bank')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/bank')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/bank')
    }
  },
  deleteBank: async (req, res) => {
    try {
      const { id } = req.params
      const bank = await Bank.findOne({ _id: id })
      await fs.unlink(path.join(`public/${bank.imageUrl}`))
      await bank.remove()
      req.flash('alertMessage', 'Success Delete Bank')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/bank')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/bank')
    }
  },

  viewItem: async (req, res) => {
    try {
      const item = await Item.find()
        .populate({
          path: 'imageId',
          select: 'id imageUrl'
        })
        .populate({
          path: 'categoryId',
          select: 'id name'
        })
      const category = await Category.find()
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/item/view_item', {
        title: 'Staycation - Item',
        item,
        category,
        alert,
        action: 'view'
      })
    } catch (error) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  addItem: async (req, res) => {
    try {
      const { title, price, city, about, categoryId } = req.body
      if (req.files.length > 0) {
        const category = await Category.findOne({ _id: categoryId })
        const newItem = {
          categoryId,
          title,
          description: about,
          price,
          imageId: [],
          city
        }
        const item = await Item.create(newItem)
        category.itemId.push({ _id: item._id })
        await category.save()
        for (let i = 0; i < req.files.length; i++) {
          const imageSave = await Image.create({
            imageUrl: `images/${req.files[i].filename}`
          })
          item.imageId.push({ _id: imageSave._id })
          await item.save()
        }
      }
      req.flash('alertMessage', 'Success Add Item')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/item')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  showImageItem: async (req, res) => {
    try {
      const { id } = req.params
      const item = await Item.findOne({ _id: id }).populate({
        path: 'imageId',
        select: 'id imageUrl'
      })
      const category = await Category.find()
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/item/view_item', {
        title: 'Staycation | Show Image Item',
        item,
        alert,
        category,
        action: 'show-image'
      })
    } catch (error) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  showEditItem: async (req, res) => {
    try {
      const { id } = req.params
      const item = await Item.findOne({ _id: id })
        .populate({
          path: 'imageId',
          select: 'id imageUrl'
        })
        .populate({
          path: 'categoryId',
          select: 'id name'
        })
      const category = await Category.find()
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/item/view_item', {
        title: 'Staycation | Edit Item',
        item,
        alert,
        category,
        action: 'edit'
      })
    } catch (error) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  editItem: async (req, res) => {
    try {
      const { id } = req.params
      const { title, price, city, about, categoryId } = req.body
      const item = await Item.findOne({ _id: id })
        .populate({
          path: 'imageId',
          select: 'id imageUrl'
        })
        .populate({
          path: 'categoryId',
          select: 'id name'
        })
      if (req.files.length > 0) {
        for (let i = 0; i < item.imageId.length; i++) {
          const imageUpdate = await Image.findOne({ _id: item.imageId[i]._id })
          await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`))
          imageUpdate.imageUrl = `images/${req.files[i].filename}`
          await imageUpdate.save()
        }
        item.title = title
        item.price = price
        item.city = city
        item.description = about
        item.categoryId = categoryId
        await item.save()
        req.flash('alertMessage', 'Success Update Item')
        req.flash('alertStatus', 'success')
        res.redirect('/admin/item')
      } else {
        item.title = title
        item.price = price
        item.city = city
        item.description = about
        item.categoryId = categoryId
        await item.save()
        req.flash('alertMessage', 'Success Update Item')
        req.flash('alertStatus', 'success')
        res.redirect('/admin/item')
      }
    } catch (error) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params
      const item = await Item.findOne({ _id: id }).populate({
        path: 'imageId',
        select: 'id imageUrl'
      })
      for (let i = 0; i < item.imageId.length; i++) {
        await fs.unlink(path.join(`public/${item.imageId[i].imageUrl}`))
      }
      await item.remove()
      req.flash('alertMessage', 'Success Delete Item')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/item')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  viewDetailItem: async (req, res) => {
    try {
      const { itemId } = req.params
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      const feature = await Feature.find({ itemId })
      const activity = await Activity.find({ itemId })
      res.render('admin/item/detail_item/view_detail_item', {
        title: 'Staycation | Detail Item',
        alert,
        itemId,
        feature,
        activity
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`admin/item/show-detail-item/${itemId}`)
    }
  },

  addFeature: async (req, res) => {
    const { name, itemId, qty } = req.body
    try {
      if (!req.file) {
        req.flash('alertMessage', `Harus ada file yg dikirim`)
        req.flash('alertStatus', 'danger')
        res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
      const feature = await Feature.create({
        name,
        qty,
        itemId,
        imageUrl: `images/${req.file.filename}`
      })
      const item = await Item.findOne({ _id: itemId })
      item.featureId.push({ _id: feature._id })
      await item.save()
      req.flash('alertMessage', 'Success Add Feature')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    }
  },
  editFeature: async (req, res) => {
    const { id, name, itemId, qty } = req.body
    try {
      const feature = await Feature.findOne({ _id: id })
      if (req.file) {
        await fs.unlink(path.join(`public/${feature.imageUrl}`))
        feature.imageUrl = `images/${req.file.filename}`
        feature.name = name
        feature.itemId = itemId
        feature.qty = qty
        await feature.save()
        req.flash('alertMessage', 'Success Update Feature')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/show-detail-item/${itemId}`)
      } else {
        feature.name = name
        feature.itemId = itemId
        feature.qty = qty
        await feature.save()
        req.flash('alertMessage', 'Success Update Feature')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    }
  },
  deleteFeature: async (req, res) => {
    const { id, itemId } = req.params
    try {
      const feature = await Feature.findOne({ _id: id })
      const item = await Item.findOne({ _id: itemId }).populate('featureId')
      for (let i = 0; i < item.featureId.length; i++) {
        if (item.featureId[i]._id.toString() === feature._id.toString()) {
          item.featureId.pull({ _id: feature._id })
          await item.save()
        }
      }
      await fs.unlink(path.join(`public/${feature.imageUrl}`))
      await feature.remove()
      req.flash('alertMessage', 'Success Delete Feature')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    }
  },

  // Activity
  addActivity: async (req, res) => {
    const { name, itemId, type } = req.body
    try {
      if (!req.file) {
        req.flash('alertMessage', `Harus ada file yg dikirim`)
        req.flash('alertStatus', 'danger')
        res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
      const activity = await Activity.create({
        name,
        type,
        itemId,
        imageUrl: `images/${req.file.filename}`
      })
      const item = await Item.findOne({ _id: itemId })
      item.activityId.push({ _id: activity._id })
      await item.save()
      req.flash('alertMessage', 'Success Add Activity')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    }
  },
  editActivity: async (req, res) => {
    const { id, name, itemId, type } = req.body
    try {
      const activity = await Activity.findOne({ _id: id })
      if (req.file) {
        await fs.unlink(path.join(`public/${activity.imageUrl}`))
        activity.imageUrl = `images/${req.file.filename}`
        activity.name = name
        activity.itemId = itemId
        activity.type = type
        await activity.save()
        req.flash('alertMessage', 'Success Update Activity')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/show-detail-item/${itemId}`)
      } else {
        activity.name = name
        activity.itemId = itemId
        activity.type = type
        await activity.save()
        req.flash('alertMessage', 'Success Update Activity')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    }
  },
  deleteActivity: async (req, res) => {
    const { id, itemId } = req.params
    try {
      const activity = await Activity.findOne({ _id: id })
      const item = await Item.findOne({ _id: itemId }).populate('activityId')
      for (let i = 0; i < item.activityId.length; i++) {
        if (item.activityId[i]._id.toString() === activity._id.toString()) {
          item.activityId.pull({ _id: activity._id })
          await item.save()
        }
      }
      await fs.unlink(path.join(`public/${activity.imageUrl}`))
      await activity.remove()
      req.flash('alertMessage', 'Success Delete Activity')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    }
  },

  viewBooking: async (req, res) => {
    const alertMessage = req.flash('alertMessage')
    const alertStatus = req.flash('alertStatus')
    const alert = { message: alertMessage, status: alertStatus }
    try {
      const booking = await Booking.find()
        .populate('memberId')
        .populate('bankId')
        .populate({
          path: 'itemId',
          select: 'id title price duration'
        })
      req.flash('alertMessage', `Berhasil Konfirmasi Pembayaran`)
      req.flash('alertStatus', 'success')
      res.render('admin/booking/view_booking', {
        title: 'Staycation - Booking',
        booking,
        alert
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/booking/view_booking`)
    }
  },
  viewDetailBooking: async (req, res) => {
    const { id } = req.params
    const alertMessage = req.flash('alertMessage')
    const alertStatus = req.flash('alertStatus')
    const alert = { message: alertMessage, status: alertStatus }
    try {
      const booking = await Booking.findOne({ _id: id })
        .populate('memberId')
        .populate('bankId')
      res.render('admin/booking/show_detail_booking', {
        title: 'Staycation - Booking',
        booking,
        alert
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/booking/show_detail_booking`)
    }
  },
  actionConfirmation: async (req, res) => {
    const { id } = req.params
    try {
      const booking = await Booking.findOne({ _id: id })
      console.log(`id`, id)
      console.log(`booking`, booking)
      booking.payments.status = "Accept"
      await booking.save()
      req.flash('alertMessage', `Berhasil Konfirmasi Pembayaran`)
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/booking/${id}`)
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/booking/${id}`)
    }
  },
  actionReject: async (req, res) => {
    const { id } = req.params
    try {
      const booking = await Booking.findOne({ _id: id })
      booking.payments.status = "Reject"
      await booking.save()
      req.flash('alertMessage', `Berhasil Reject Pembayaran`)
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/booking/${id}`)
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/booking/${id}`)
    }
  }
}
