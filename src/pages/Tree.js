import { SelectedNodeModal } from "../components/tree/SelectedNodeModal";

import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import styled from "styled-components";
import {
  returnNodeList,
  returnLinkList,
  returnSelectedList,
} from "../lib/testCode";
import { colorPalette, boxShadow } from "../lib/style";
import { reduxStore } from "../index";
import { selectNode } from "../redux/tree";

export const TreePage = React.memo(() => {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (containerRef.current) {
      initGraph(containerRef.current);
    }
  }, [containerRef]);

  return (
    <>
      <TreeMap ref={containerRef} />
    </>
  );
});

const TreeMap = styled.div`
  border-radius: 3px;
  border: 1px solid ${colorPalette.gray3};
  background-color: #ffffff;
  box-shadow: ${boxShadow.default};
`;

const MapWidth = 1200;
const MapHeight = 700;

function initGraph(container) {
  const linkWidth = "2.5px";
  const linkColor = "#999999"; //colorPalette.gray3;
  const width = MapWidth;
  const height = MapHeight;

  const nodeRadius = 20;
  const nodeColor = "#00bebe"; //colorPalette.mainGreen;

  const selectedColor = "#00bebe"; //colorPalette.green2;
  const selectedNodeStrokeWidth = "8px";

  const selectedNodeList = reduxStore.getState().tree.selectedNodeList;

  const labelSize = "16px"; //fontSize.medium
  const deleteButtonLength = 15;

  let nodeList = returnNodeList();
  let linkList = returnLinkList(); //reduxStore.getState().techtree.linkList;
  //let originalThumbnailURL = reduxStore.getState().techtree.techtreeData
  //  .thumbnail;
  //let tempThumbnailURL = reduxStore.getState().techtree.techtreeData.thumbnail;
  let tempPairingNodes = {
    startNodeID: null,
    startX: null,
    startY: null,
    endNodeID: null,
    id: null,
    endX: null,
    endY: null,
  };

  // tree edit 상태도 d3 로 처리하자.
  // docu edit 은 modal 의 로컬 스테이트로 처리하고.
  // node 를 클릭하면 실제 DOM을 생성하고 삭제하고 하는 식으로 하자.

  const svg = d3
    .select(container)
    .append("svg")
    .attr("id", "techtreeContainer")
    .attr("viewBox", `0 0 ${width} ${height}`);

  // 마우스 드래그할때 나타나는 임시 라인 만들어두기.
  svg
    .append("g")
    .append("line")
    .attr("class", "tempLine")
    .style("stroke", linkColor)
    .style("stroke-width", linkWidth)
    .attr("marker-end", "url(#temp-end-arrow)")
    .style("opacity", "0")
    .attr("display", "none");

  // 화살표 마커
  svg
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "end-arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", nodeRadius * 1.1)
    .attr("markerWidth", 6)
    .attr("markerHeight", nodeRadius * 1.5)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", linkColor);

  // tempLine만을 위한 화살표 마커
  svg
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "temp-end-arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 9)
    .attr("markerWidth", 6)
    .attr("markerHeight", nodeRadius * 1.5)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", linkColor);

  const linkGroup = svg.append("g").attr("class", "links");
  const nodeGroup = svg.append("g").attr("class", "nodes");
  const labelGroup = svg.append("g").attr("class", "labels");

  const createdLinkGroup = linkGroup
    .selectAll("line")
    .data(linkList)
    .join("line")
    .attr("x1", (d) => d.startX)
    .attr("y1", (d) => d.startY)
    .attr("x2", (d) => d.endX)
    .attr("y2", (d) => d.endY)
    .attr("class", (d) => d.id)
    .style("stroke", linkColor)
    .style("stroke-width", linkWidth)
    .attr("marker-end", "url(#end-arrow)");

  function initNode() {
    const createdNodeGroup = nodeGroup
      .selectAll("circle")
      .data(nodeList)
      .join("circle")
      .attr("r", (d) => nodeRadius)
      .style("fill", (d) => d.fillColor)
      .attr("cx", (d) => {
        return d.x;
      })
      .attr("cy", (d) => {
        return d.y;
      })
      .attr("class", (d) => {
        return d.id;
      })
      .style("stroke", (node) => {
        if (
          reduxStore.getState().tree.selectedNodeList.find((ele) => {
            return node.id === ele.id;
          })
        ) {
          return selectedColor;
        } else {
          return;
        }
      })
      .style("stroke-width", selectedNodeStrokeWidth)
      .on("click", (node) => {
        reduxStore.dispatch(selectNode(node));
        const id = Math.random(); //or some such identifier
        const d = document.createElement("div");
        d.id = node.id;
        document.getElementById("root").appendChild(d);
        ReactDOM.render(
          <SelectedNodeModal node={node} />,
          document.getElementById(node.id)
        );
      })
      .style("cursor", "pointer");
  }

  reduxStore.subscribe(initNode);
  initNode();
}
