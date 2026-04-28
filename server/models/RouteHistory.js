const mongoose = require('mongoose');
const User = require('./User');

const routeHistorySchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    from:   { type: String, required: true },
    to:     { type: String, required: true },
    stops:  [String],
    routes: [mongoose.Schema.Types.Mixed],
}, {timestamps: true});

routeHistorySchema.index({userId: 1,
    createdAt: -1
});

module.exports = mongoose.model('RoouteHistory', routeHistorySchema);