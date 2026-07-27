import { test } from "node:test"
import assert from "node:assert/strict"
import { splitSentences, signature, sameShapeRun, topLevelCommas } from "../bin/lib/sentences.mjs"

const ABBR = ["v.v.", "TP.", "ThS."]

const PACK = {
  openers: {
    dai_tu: ["chúng tôi", "tôi"],
    lien_tu: ["nhưng", "và"],
    trang_ngu: ["trong", "sau khi"],
  },
  tackon: ["góp phần", "mang lại"],
}

test("splits on period followed by space", () => {
  assert.deepEqual(splitSentences("Câu một. Câu hai.", ABBR), ["Câu một.", "Câu hai."])
})

test("does not require an uppercase letter after the period", () => {
  assert.deepEqual(
    splitSentences("Doanh thu tăng. chi phí cũng tăng.", ABBR),
    ["Doanh thu tăng.", "chi phí cũng tăng."]
  )
})

test("does not split a decimal number", () => {
  assert.deepEqual(splitSentences("ROAS đạt 3.4 trong tháng.", ABBR), ["ROAS đạt 3.4 trong tháng."])
})

test("does not split when there is no space after the period", () => {
  assert.deepEqual(splitSentences("Chi nhánh TP.HCM mở cửa.", ABBR), ["Chi nhánh TP.HCM mở cửa."])
})

test("does not split on a known abbreviation", () => {
  assert.deepEqual(splitSentences("Gồm A, B, v.v. và C.", ABBR), ["Gồm A, B, v.v. và C."])
})

test("does not split inside a code span", () => {
  assert.deepEqual(splitSentences("Gọi `a.b()` rồi dừng.", ABBR), ["Gọi `a.b()` rồi dừng."])
})

test("does not split inside a markdown link url", () => {
  assert.deepEqual(
    splitSentences("Xem [tài liệu](https://a.com/b.html) nhé.", ABBR),
    ["Xem [tài liệu](https://a.com/b.html) nhé."]
  )
})

test("end of block is a boundary even without punctuation", () => {
  assert.deepEqual(splitSentences("Tiêu đề không có dấu chấm", ABBR), ["Tiêu đề không có dấu chấm"])
})

test("handles question and exclamation marks", () => {
  assert.deepEqual(splitSentences("Đúng không? Có chứ!", ABBR), ["Đúng không?", "Có chứ!"])
})

test("opener classes resolve in priority order", () => {
  assert.equal(signature("3 chiến dịch chạy tốt.", PACK).opener, "so")
  assert.equal(signature("Chúng tôi triển khai.", PACK).opener, "dai_tu")
  assert.equal(signature("Nhưng chi phí tăng.", PACK).opener, "lien_tu")
  assert.equal(signature("Trong tháng 6, CPA giảm.", PACK).opener, "trang_ngu")
  assert.equal(signature("Doanh thu tăng.", PACK).opener, "khac")
})

test("clause count is top level commas plus one", () => {
  assert.equal(topLevelCommas("Một mệnh đề."), 0)
  assert.equal(signature("Một mệnh đề.", PACK).clauses, 1)
  assert.equal(signature("Một, hai.", PACK).clauses, 2)
  assert.equal(signature("Doanh thu 1,250,000 đồng.", PACK).clauses, 1)
  assert.equal(signature("Kết quả (a, b) tốt.", PACK).clauses, 1)
})

test("tackon is detected on the last clause", () => {
  assert.equal(signature("CPA giảm, góp phần cải thiện ROAS.", PACK).tackon, true)
  assert.equal(signature("CPA giảm, ROAS tăng.", PACK).tackon, false)
  assert.equal(signature("Góp phần cải thiện ROAS.", PACK).tackon, false)  // one clause only
})

test("three same-shape sentences make a run of 3", () => {
  const s = [
    "Chúng tôi tăng ngân sách, mang lại kết quả tốt.",
    "Chúng tôi đổi creative, mang lại tương tác cao.",
    "Chúng tôi mở kênh mới, mang lại lượt xem lớn.",
  ]
  assert.equal(sameShapeRun(s, PACK), 3)
})

test("two khac openers never count as the same shape", () => {
  const s = ["Doanh thu tăng.", "Chi phí giảm.", "Lợi nhuận ổn."]
  assert.equal(sameShapeRun(s, PACK), 1)
})

test("a differing clause count breaks the run", () => {
  const s = [
    "Chúng tôi tăng ngân sách, mang lại kết quả tốt.",
    "Chúng tôi đổi creative.",
    "Chúng tôi mở kênh mới, mang lại lượt xem lớn.",
  ]
  assert.equal(sameShapeRun(s, PACK), 1)
})

test("an empty list has a run of 0", () => {
  assert.equal(sameShapeRun([], PACK), 0)
})
