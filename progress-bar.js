import cliProgress from 'cli-progress';

export default class ProgressBar extends cliProgress.SingleBar {
  constructor(totalSizeInBytes, opts) {
    super(opts, cliProgress.Presets.shades_classic);
    this.start(totalSizeInBytes, 0, {
      speed: 'N/A',
      nProcessedItems: 0,
    });
  }
}
