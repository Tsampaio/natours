const Tour = require('./../models/tourModel');

exports.aliasTopTours = ( req, res, next ) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
}

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    //BUILD THE QUERY
    //1a) Filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    //1b) Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    console.log(JSON.parse(queryStr));
    
    let query = Tour.find( JSON.parse(queryStr) );

    //2) Sorting 
    if(req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //3) Field limiting
    if(req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //4) Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    //page=2&limit=10, 1-10 -> page1, 11-20 -> page2
    //skip(10) results to get to page 2
    //skip(20) results to get to page 3
    query = query.skip(skip).limit(limit);

    if(req.query.page) {
      const numTours = await Tour.countDocuments();
      if( skip >= numTours ) throw new Error('This page does not exist');
    }

    //{ difficulty: 'easy', duration: { $gte: '5' } }
    //{ difficulty: 'easy', duration: { gte: '5' } }
    //gte, gt, lte, lt

    // const query = await Tour.find( req.query );

    

    //EXECUTE THE QUERY
    const tours = await query;

    // const query = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy'
    // });

    // const query = await Tour.find()
    // .where('duration')
    // .equals(5)
    // .where('difficulty')
    // .equals('easy');

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
  
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
  
};

exports.createTour = async (req, res) => {
  try {
  // const newTour = new Tour({});
  // newTour.save();
  //same thing
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid Data sent'
    })
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
  
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
  
};
