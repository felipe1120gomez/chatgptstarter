import { Writable } from 'stream';
import type { NextApiRequest } from 'next';
import type { File } from 'formidable';
import formidable, { IncomingForm } from 'formidable';

export const formidablePromise = (
  req: NextApiRequest,
  opts?: Parameters<typeof formidable>[0],
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((accept, reject) => {
    const form = formidable(opts);

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return accept({ fields, files });
    });
  });
};

export const fileConsumer = (
  file: File,
  endBuffers: {
    [filename: string]: Buffer;
  },
) => {
  console.log('fileConsumer:', file.newFilename, file);

  const chunks: any = [];

  const writable = new Writable({
    write: (chunk, _enc, next) => {
      chunks.push(chunk);
      next();
    },
    destroy() {
      endBuffers = {};
    },
    final(cb) {
      const buffer = Buffer.concat(chunks);
      endBuffers[file.newFilename] = buffer;
      console.log('fileConsumer:', file.newFilename, endBuffers);

      cb();
    },
  });

  return writable;
};
