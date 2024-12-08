export default function (parsedMail, outFolder, id) {
    const fileName = `${outFolder}/${id}-${Math.ceil(Math.random() * 100000)}.eml`;
  return Bun.write(fileName, parsedMail);
}
