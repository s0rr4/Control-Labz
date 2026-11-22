import Counter from '../models/Counter.js';

export async function nextSequence(name, options = {}) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { new: true, upsert: true, ...options }
  );
  return counter.value;
}
