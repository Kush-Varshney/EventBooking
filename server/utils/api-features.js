const { Op } = require("sequelize")

class APIFeatures {
  constructor(model, queryString) {
    this.model = model
    this.queryString = queryString
    this.queryOptions = {
      where: {},
      order: [],
      limit: null,
      offset: null,
      include: [],
    }
  }

  filter() {
    const queryObj = { ...this.queryString }
    const excludedFields = ["page", "sort", "limit", "fields", "search"]
    excludedFields.forEach((el) => delete queryObj[el])

    // Handle special filters
    if (queryObj.location) {
      this.queryOptions.where.location = {
        [Op.iLike]: `%${queryObj.location}%`,
      }
      delete queryObj.location
    }

    if (queryObj.dateFrom || queryObj.dateTo) {
      this.queryOptions.where.dateTime = {}
      if (queryObj.dateFrom) {
        this.queryOptions.where.dateTime[Op.gte] = new Date(queryObj.dateFrom)
      }
      if (queryObj.dateTo) {
        this.queryOptions.where.dateTime[Op.lte] = new Date(queryObj.dateTo)
      }
      delete queryObj.dateFrom
      delete queryObj.dateTo
    }

    if (queryObj.minPrice || queryObj.maxPrice) {
      this.queryOptions.where.price = {}
      if (queryObj.minPrice) {
        this.queryOptions.where.price[Op.gte] = Number.parseFloat(queryObj.minPrice)
      }
      if (queryObj.maxPrice) {
        this.queryOptions.where.price[Op.lte] = Number.parseFloat(queryObj.maxPrice)
      }
      delete queryObj.minPrice
      delete queryObj.maxPrice
    }

    // Handle search
    if (this.queryString.search) {
      this.queryOptions.where[Op.or] = [
        { title: { [Op.iLike]: `%${this.queryString.search}%` } },
        { description: { [Op.iLike]: `%${this.queryString.search}%` } },
        { location: { [Op.iLike]: `%${this.queryString.search}%` } },
      ]
    }

    // Add remaining filters
    Object.keys(queryObj).forEach((key) => {
      this.queryOptions.where[key] = queryObj[key]
    })

    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").map((field) => {
        if (field.startsWith("-")) {
          return [field.substring(1), "DESC"]
        }
        return [field, "ASC"]
      })
      this.queryOptions.order = sortBy
    } else {
      this.queryOptions.order = [["createdAt", "DESC"]]
    }

    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",")
      this.queryOptions.attributes = fields
    }

    return this
  }

  paginate() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 10
    const offset = (page - 1) * limit

    this.queryOptions.limit = limit
    this.queryOptions.offset = offset

    return this
  }

  getQueryOptions() {
    return this.queryOptions
  }
}

module.exports = APIFeatures
