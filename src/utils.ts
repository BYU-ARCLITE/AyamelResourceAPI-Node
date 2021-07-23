function fixId(doc: any) {
  doc.id = doc._id;
  delete doc._id;
  return doc;
}

export {
  fixId
};
