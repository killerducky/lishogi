var util = require("../util");
var assert = require("../assert");
var arrow = util.arrow;

var imgUrl = util.assetUrl + "images/learn/bowman.svg";

module.exports = {
  key: "capture",
  title: "capture",
  subtitle: "takeTheEnemyPieces",
  image: imgUrl,
  intro: "captureIntro",
  illustration: util.roundSvg(imgUrl),
  levels: [
    {
      // rook
      goal: "takeTheBlackPieces",
      fen: "9/2p2p3/9/9/9/2R6/9/9/9 b -",
      nbMoves: 2,
      captures: 2,
      shapes: [arrow("c4c8"), arrow("c8f8")],
      success: assert.extinct("black"),
    },
    {
      // queen
      goal: "takeTheBlackPiecesAndDontLoseYours",
      fen: "8/2r2p2/8/8/5Q2/8/8/8 b -",
      nbMoves: 2,
      captures: 2,
      shapes: [arrow("f4c7"), arrow("f4f7", "red"), arrow("c7f7", "yellow")],
      success: assert.extinct("black"),
    },
    {
      // bishop
      goal: "takeTheBlackPiecesAndDontLoseYours",
      fen: "8/5r2/8/1r3p2/8/3B4/8/8 b -",
      nbMoves: 5,
      captures: 3,
      success: assert.extinct("black"),
    },
    {
      // queen
      goal: "takeTheBlackPiecesAndDontLoseYours",
      fen: "8/5b2/5p2/3n2p1/8/6Q1/8/8 b -",
      nbMoves: 7,
      captures: 4,
      success: assert.extinct("black"),
    },
    {
      // knight
      goal: "takeTheBlackPiecesAndDontLoseYours",
      fen: "8/3b4/2p2q2/8/3p1N2/8/8/8 b -",
      nbMoves: 6,
      captures: 4,
      success: assert.extinct("black"),
    },
  ].map(function (l, i) {
    l.pointsForCapture = true;
    return util.toLevel(l, i);
  }),
  complete: "captureComplete",
};
