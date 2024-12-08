import { pipeline } from 'node:stream/promises';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import split from 'line-stream';
import { Mbox } from 'node-mbox';
import ProgressStream from 'progress-stream';
import ParallelWriter from './parallel-writer';
import ProgressBar from './progress-bar';
import saveToDisk from './saveToDisk';
import parseCommandLine from './cmdline.js';

const mboxReader = new Mbox({
  encoding: 'utf-8',
  stream: true,
  includeMboxHeader: true,
});

function extractMBox(mboxFilePath, outFolder) {
  console.log(`\nExtracting eMails:\n  from: ${mboxFilePath}\n  to: ${outFolder}\n`);
  return stat(mboxFilePath).then(({ size: fileSizeInBytes }) => {
    // setup the stream progress monitor & bar
    const progressMonitor = ProgressStream({
      length: fileSizeInBytes,
      time: 1250, //ms
    });
    const pBar = new ProgressBar(fileSizeInBytes, {
      format:
        '{nProcessedItems} Mails in {duration_formatted} [{bar}] {percentage}% | {value}/{total} | ETA: {eta_formatted}',
    });
    progressMonitor.on('progress', (curState) => {
      pBar.update(curState.transferred, { nProcessedItems: parseNDump.nProcessedItems });
    });

    const parseNDump = new ParallelWriter({
      concurrency: 5,
      writeCB: (emlData, nProcessedItems) => {
        const p = saveToDisk(emlData, outFolder, nProcessedItems);
        // const p = simpleParser(data, {
        //   skipImageLinks: true, // Skip converting CID attachments to data URL images
        //   skipHtmlToText: true, // generate plaintext from HTML if needed
        //   skipTextToHtml: true, // generate HTML from plaintext if needed
        //   skipTextLinks: true, // do not linkify links in plaintext content
        // }).then(saveToDisk);
        return p;
      },
    });

    // setup the pipeline and start it
    return pipeline([
      createReadStream(mboxFilePath, { encoding: 'utf-8' }),
      split('\n'),
      mboxReader,
      progressMonitor,
      parseNDump,
    ])
      .then(() => {
        pBar.update(fileSizeInBytes, { nProcessedItems: parseNDump.nProcessedItems });
      })
      .finally(() => {
        pBar.stop();
      });
  });
}

const options = parseCommandLine();
extractMBox(options.src.filePath, options.out.folderPath)
  .then(() => console.log('\nDone.'))
  .catch((ex) => console.error('\nError: ', ex.message));
