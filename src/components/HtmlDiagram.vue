<template>
  <div class="container-diagram">
    <h3>Diagram</h3>
    <div class="diagram" id="diagram">
      <div class="node-list">
        <div
          class="node-row d-flex justify-content-around"
          v-for="(nodeList, level) in rankedHierachy"
          :key="level"
        >
          <div
            class="node p-3 bg-warning ro text-dark border rounded-3 mb-5"
            v-for="node in nodeList"
            :key="node.id"
            :id="node.id"
          >
            <p class="node-title fw-bold text-center border-bottom border-dark">
              {{ node.title }}
            </p>
            <ul>
              <li v-for="(value, name) in node.attributes" :key="name" class="">
                <span class="icon-holder d-inline-block justify-content-center"
                  ><i :class="calculateIcon(name)"></i
                ></span>
                <span>{{ name }}: {{ value }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { debounce, isEqual } from "lodash";
import { drawConnectingLine } from "@/common/helperFunction/helper.js";
export default {
  props: {
    rankedHierachy: {
      type: Object,
    },
  },
  watch: {
    rankedHierachy: {
      handler: function () {
        this.drawConnectingLine();
      },
    },
  },
  methods: {
    calculateIcon: function (name) {
      if (name[0] == "@" || name.includes("v-on")) return "fas fa-bolt";
      switch (name) {
        case "class":
        case ":class":
          return "fas fa-user-friends";
        case "style":
        case ":style":
          return "fas fa-palette";
        case "ref":
          return "fas fa-tag";
        case "v-if":
        case "v-else":
          return "fas fa-toggle-on";
        case "v-show":
          return "fas fa-eye";
        case "v-model":
          return "fas fa-exchange-alt";
        default:
          return "fab fa-product-hunt";
      }
    },
    drawConnectingLine: debounce(function () {
      const connectingLineArr = [
        ...document.getElementsByClassName("connecting-line"),
      ];
      if (connectingLineArr.length > 0) {
        connectingLineArr.forEach((n) => {
          n.remove();
        });
      }
      console.log("drawing");
      const allRankigArr = Object.keys(this.rankedHierachy).map((level) =>
        parseInt(level)
      );

      allRankigArr.forEach((level, index) => {
        if (index === 0) {
          return;
        }

        this.rankedHierachy[level].forEach((childNode) => {
          const childNodeIdArr = childNode.id.split("-");
          this.rankedHierachy[level - 1].forEach((parentNode) => {
            const parentNodeIdArr = parentNode.id.split("-");
            if (isEqual(childNodeIdArr.slice(0, -1), parentNodeIdArr)) {
              const parentDomNode = document.getElementById(parentNode.id);
              const childDomNode = document.getElementById(childNode.id);
              const connectingElement = drawConnectingLine(
                parentDomNode,
                childDomNode
              );
              document.getElementById("diagram").appendChild(connectingElement);
            }
          });
        });
      });
    }, 100),
  },
  created() {
    window.addEventListener("resize", () => {
      this.$nextTick(() => {
        this.drawConnectingLine();
      });
    });
  },
};
</script>
<style lang="scss" scoped>
.node-row {
  font-size: 12px;
}
.icon-holder {
  width: 25px;
}
</style>
