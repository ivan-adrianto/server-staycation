const Item = require('../models/Item')
const Treasure = require('../models/Activity')
const Traveler = require('../models/Booking')
const Category = require('../models/Category')

module.exports = {
  landingPage: async (req, res) => {
    try {
      const mostPicked = await Item.find()
        .select('_id title country city price unit imageId')
        .limit(5)
        .populate({ path: 'imageId', select: '_id imageUrl' })
      const category = await Category.find()
        .select()
        .select('_id name')
        .limit(3)
        .populate({
          path: 'itemId',
          select: '_id title country city isPopular unit imageId sumBooking',
          populate: {
            path: 'imageId',
            select: '_id imageUrl',
            limit: 1
          },
          option: { sort: { sumBooking: -1 } },
          perDocumentLimit: 4
        })
      const traveler = await Traveler.find()
      const treasure = await Treasure.find()
      const city = await Item.find()
      category.map(categoryItem =>
        categoryItem.itemId.map( async(item, itemIndex) => {
          const searchedItem = await Item.findOne({_id: item._id})
          if (itemIndex === (categoryItem.itemId.length - 1)) {
            searchedItem.isPopular = true
            await searchedItem.save()
          } else {
            searchedItem.isPopular = false
            await searchedItem.save()
          }
        })
      )
      const testimonial = {
        _id: "fhjefhi1309ksfndd",
        imageUrl: "images/testimonial1.png",
        name: "Happy Family",
        rate: 4.55,
        content: "What a great trip  with my family and I should try again next time soon...",
        familyName: "Angga",
        familyOccupation: "Product Designer"
      }
      res.status(200).json({
        hero: {
          travelers: traveler.length,
          treasures: treasure.length,
          cities: city.length
        },
        mostPicked,
        category,
        testimonial
      })
    } catch (error) {
      console.log(`error`, error)
      res.message({message: "Internal Server Error"})
    }
  }
}
