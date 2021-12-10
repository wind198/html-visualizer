export const drawConnectingLine = function (firstDomNode, secondDomNode) {
  const firstPos = getDomNodeCenterPos(firstDomNode);
  const secondPos = getDomNodeCenterPos(secondDomNode);
  const firstPosModified = {
    xPos: firstPos.xPos,
    yPos: firstPos.yPos + firstPos.domHeight * 0.49,
  };
  const secondPosModified = {
    xPos: secondPos.xPos,
    yPos: secondPos.yPos - secondPos.domHeight * 0.49,
  };
  const connectingElement = document.createElement("div");
  connectingElement.classList.add("connecting-line");
  const { xPos, yPos, length, angle } = calculateConnectingLineDimension(
    firstPosModified,
    secondPosModified
  );

  connectingElement.style.top = `${yPos}px`;
  connectingElement.style.left = `${xPos}px`;
  connectingElement.style.height = "0px";
  connectingElement.style.width = `${length}px`;
  connectingElement.style.transform = `rotate(${angle}deg)`;
  return connectingElement;
};
const getDomNodeCenterPos = function (domNode) {
  const cornerX = domNode.offsetLeft;
  const cornerY = domNode.offsetTop;
  const domWidth = domNode.offsetWidth;
  const domHeight = domNode.offsetHeight;
  const centerX = cornerX + domWidth / 2;
  const centerY = cornerY + domHeight / 2;
  return {
    xPos: centerX,
    yPos: centerY,
    domWidth,
    domHeight,
  };
};
const calculateConnectingLineDimension = function (firstPos, secondPos) {
  const length = Math.sqrt(
    Math.pow(firstPos.xPos - secondPos.xPos, 2) +
      Math.pow(firstPos.yPos - secondPos.yPos, 2)
  );
  let angle = radToDeg(
    Math.atan(
      (secondPos.yPos - firstPos.yPos) / (secondPos.xPos - firstPos.xPos)
    )
  );
  if (angle < 0) {
    angle = 180 + angle;
  }
  return {
    xPos: firstPos.xPos,
    yPos: firstPos.yPos,
    length,
    angle,
  };
};
const radToDeg = function (angle) {
  const pi = Math.PI;
  return angle * (180 / pi);
};
