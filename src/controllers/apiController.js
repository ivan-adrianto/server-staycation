const Item = require("../models/Item");
const Treasure = require("../models/Activity");
const Traveler = require("../models/Booking");
const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Booking = require("../models/Booking");
const Member = require("../models/Member");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const mostPicked = await Item.find()
        .select("_id title country city price unit imageId")
        .limit(5)
        .populate({ path: "imageId", select: "_id imageUrl" });
      const category = await Category.find()
        .select()
        .select("_id name")
        .limit(3)
        .populate({
          path: "itemId",
          select: "_id title country city isPopular unit imageId sumBooking",
          populate: {
            path: "imageId",
            select: "_id imageUrl",
            limit: 1,
          },
          option: { sort: { sumBooking: -1 } },
          perDocumentLimit: 4,
        });
      const traveler = await Traveler.find();
      const treasure = await Treasure.find();
      const city = await Item.find();
      category.map((categoryItem) =>
        categoryItem.itemId.map(async (item, itemIndex) => {
          const searchedItem = await Item.findOne({ _id: item._id });
          if (itemIndex === categoryItem.itemId.length - 1) {
            searchedItem.isPopular = true;
            await searchedItem.save();
          } else {
            searchedItem.isPopular = false;
            await searchedItem.save();
          }
        })
      );
      const testimonial = {
        _id: "fhjefhi1309ksfndd",
        imageUrl: "images/testimonial1.png",
        name: "Happy Family",
        rate: 4.55,
        content:
          "What a great trip  with my family and I should try again next time soon...",
        familyName: "Angga",
        familyOccupation: "Product Designer",
      };
      res.status(200).json({
        hero: {
          travelers: traveler.length,
          treasures: treasure.length,
          cities: city.length,
        },
        mostPicked,
        category,
        testimonial,
      });
    } catch (error) {
      console.log(`error`, error);
      res.message({ message: "Internal Server Error" });
    }
  },
  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({ path: "featureId", select: "_id name qty imageurl" })
        .populate({ path: "activityId", select: "_id name type imageurl" })
        .populate({ path: "imageId", select: "_id imageUrl" });
      const bank = await Bank.find();
      const testimonial = {
        _id: "fhjefhi1309ksfndd",
        imageUrl: "images/testimonial1.png",
        name: "Happy Family",
        rate: 4.55,
        content:
          "What a great trip  with my family and I should try again next time soon...",
        familyName: "Angga",
        familyOccupation: "Product Designer",
      };
      res.status(200).json({
        ...item._doc,
        bank,
        testimonial,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  bookingPage: async (req, res) => {
    try {
      const {
        idItem,
        duration,
        // price,
        bookingStartDate,
        bookingEndDate,
        firstName,
        lastName,
        email,
        phoneNumber,
        accountHolder,
        bankFrom,
        proofPayment,
      } = req.body;
      if (!req.file) {
        return res.status(404).json({message: "Image not found"});
      }
      if (idItem === undefined) {
        return res.status(404).json({message: "idItem harus diisi"});
      }
      if (duration === undefined) {
        return res.status(404).json({message: "duration harus diisi"});
      }
      // if (price === undefined) {
      //   return res.status(404).json({message: "price harus diisi"});
      // }
      if (bookingStartDate === undefined) {
        return res.status(404).json({message: "bookingStartDate harus diisi"});
      }
      if (bookingEndDate === undefined) {
        return res.status(404).json({message: "bookingEndDate harus diisi"});
      }
      if (firstName === undefined) {
        return res.status(404).json({message: "firstName harus diisi"});
      }
      if (lastName === undefined) {
        return res.status(404).json({message: "lastName harus diisi"});
      }
      if (email === undefined) {
        return res.status(404).json({message: "email harus diisi"});
      }
      if (phoneNumber === undefined) {
        return res.status(404).json({message: "phoneNumber harus diisi"});
      }
      if (accountHolder === undefined) {
        return res.status(404).json({message: "accountHolder harus diisi"});
      }
      if (bankFrom === undefined) {
        return res.status(404).json({message: "bankFrom harus diisi"});
      }
      const item = await Item.findOne({_id: idItem})
      if (!item) {
        return res.status(404).json({message: "Item not found"})
      }

      item.sumBooking = item.sumBooking + 1

      await item.save()

      let total = item.price * duration
      let tax = total * 0.1

      const invoice = Math.floor(1000000 + Math.random() * 9000000)
      
      const member = await Member.create({
        firstName,
        lastName,
        email,
        phoneNumber
      })

      const newBooking = {
        invoice,
        bookingStartDate,
        bookingEndDate,
        total: total + tax,
        itemId: {
          _id: item.id,
          title: item.title,
          price: item.price,
          duration
        },
        memberId: member.id,
        payments: {
          proofPayment: `images/${req.file.filename}`,
          bankFrom,
          accountHolder
        }
      }

      const booking = await Booking.create(newBooking)

      res.status(201).json({message: "Success booking", booking})

    } catch (error) {
      return (res.status(500).json({message: error + ""}))
    }
  },
};
