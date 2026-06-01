function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

/** Matches mentor list controllers: { item, total, page, limit } */
function okList(res, { items, total, page, limit }, status = 200) {
  return ok(res, { item: items, total, page, limit }, status);
}

function okDeleted(res, label = 'deleted') {
  return ok(res, { [label]: true });
}

export { ok, fail, okList, okDeleted };
