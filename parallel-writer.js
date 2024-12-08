import { Writable } from 'node:stream';

// To be used as part of a pipe, with concurrent backpressure
export default class ParallelWriter extends Writable {
  constructor({ concurrency = 5, writeCB = async () => {} } = {}) {
    super();
    this.concurrency = concurrency; // maximum parallel waiting promises
    this.pendingPromises = [];
    this.writeCB = writeCB; // user callback to perform the write. Should return a promise.
    this.nReceivedBytes = 0;
    this.nProcessedItems = 0;
  }
  _write(data, enc, doneCB) {
    this.nReceivedBytes += data.length || data.size;
    // keep track of pending work
    this.pendingPromises.push(this.writeCB(data, this.nProcessedItems));
    // take care of backpressure
    this.waitForPendingPromises(doneCB, this.concurrency);
  }
  _final(doneCB) {
    // check if anything is pending
    this.waitForPendingPromises(doneCB, 1);
  }
  waitForPendingPromises(doneCB, waitLimit) {
    if (this.pendingPromises.length >= waitLimit) {
      return Promise.all(this.pendingPromises)
        .then(() => {
          this.nProcessedItems += this.pendingPromises.length;
          this.pendingPromises = [];
          doneCB();
        })
        .catch(doneCB); // passes on the error to doneCB
    } else doneCB();
  }
}
