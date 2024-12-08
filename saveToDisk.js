export default function (parsedMail, outFolder, id) {
  //const fileName = `R:/out-${parsedMail.date.toISOString().replaceAll(':', '-')}.json`;
    const fileName = `${outFolder}/${id}-${Math.ceil(Math.random() * 100000)}.eml`;
  //console.log('--------wrote: ', fileName);
  return Bun.write(fileName, parsedMail);
   //return Bun.write(fileName, JSON.stringify(parsedMail, null, 2));
}