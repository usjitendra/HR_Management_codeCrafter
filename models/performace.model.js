import mongoose ,{Schema,model} from 'mongoose';

const performanceSchema = new mongoose.Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  goals: [
    {
      title: String,
      description: String,
      weightage: Number,
      status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started',
      },
    },
  ],
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  reviewPeriod: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
 {
  timestamps:true
 }
);

export default mongoose.model('Performance', performanceSchema);
