<template>
  <div class="container-fluid py-3 px-5">
    <h1 class="text-center">HTML structure visuallizer</h1>
    <div id="container" class="container-html-input mb-3">
      <h2>HTML input</h2>
      <p>Paste your HTML code here:</p>
      <textarea
        class="html-input mb-3 d-block w-100 rounded-3 border-1 px-4 py-3"
        name="html-input"
        id="input"
        cols=""
        rows="10"
        v-model="input"
      ></textarea>
      <button class="btn btn-primary" @click="calculate">Calculate</button>
    </div>
    <html-diagram :rankedHierachy="rankedHierachy" />
  </div>
</template>

<script>
import { cloneDeep } from "lodash";
import "@/assets/style/style.scss";
import HtmlDiagram from "./components/HtmlDiagram.vue";
class Tag {
  constructor(tagName, type, attributes, childNodes) {
    this.tagName = tagName;
    this.type = type;
    this.attributes = attributes || {};
    this.childNodes = childNodes || [];
    this.status = active;
  }
}
const openTag = "open_tag";
const closeTag = "close_tag";
const selfClosingTag = "self_closing_tag";
const active = "active";
const deactive = "deactive";
const htmlStartTagRegex = /<\s*([\w-]+)(\s+([\w-@:#]+(="[^"]+")?))*\s*>/;
const htmlEndTagRegex = /<\/\s*([\w-]+)\s*>/;
const htmlSelfClosingTagRegex =
  /<\s*([\w-]+)(\s+([\w-@:#]+(="[^"]+")?))*\s*\/>/;
export default {
  components: {
    HtmlDiagram,
  },
  data() {
    return {
      input: "",
      tagArr: [],
      rankedHierachy: {},
    };
  },
  methods: {
    calculate() {
      this.extractTagFromInputString();
      this.replaceSelftClosingTag();
      this.mapIdAndRowLevel();
      this.generateRankedHierachy();
      console.log(this.tagArr);
    },
    extractTagFromInputString: function () {
      let input = this.input;
      let reachEndOfString = false;
      loop1: while (!reachEndOfString) {
        for (let index = 0; index < input.length; index++) {
          const character = input[index];
          if (index !== 0 && character === ">") {
            let newTag;
            const substring = input.slice(0, index + 1);
            let possibleTagPosition = substring.search(htmlStartTagRegex);
            if (possibleTagPosition > -1) {
              const matchedTag = [...substring.match(htmlStartTagRegex)];
              const tagName = matchedTag[1] || "";
              let attributesObj = {};
              const attributesString = matchedTag[2];
              if (attributesString) {
                const attributesArr = [
                  ...attributesString.matchAll(/([\w-@:#]+)=("[^"]+")?/g),
                ];
                attributesArr.forEach((prop) => {
                  attributesObj = Object.assign(attributesObj, {
                    [prop[1]]: prop[2],
                  });
                });
              }
              newTag = new Tag(tagName, openTag, attributesObj, []);
              this.tagArr.push(newTag);
              input = input.slice(index + 1);
              continue loop1;
            }
            possibleTagPosition = substring.search(htmlSelfClosingTagRegex);
            if (possibleTagPosition > -1) {
              const matchedTag = [...substring.match(htmlSelfClosingTagRegex)];
              const tagName = matchedTag[1] || "";
              let attributesObj = {};
              const attributesString = matchedTag[2];
              if (attributesString) {
                const attributesArr = [
                  ...attributesString.matchAll(/([\w-@:#]+)=("[^"]+")?/g),
                ];
                attributesArr.forEach((prop) => {
                  attributesObj = Object.assign(attributesObj, {
                    [prop[1]]: prop[2],
                  });
                });
              }
              newTag = new Tag(tagName, selfClosingTag, attributesObj, []);
              this.tagArr.push(newTag);
              input = input.slice(index + 1);
              continue loop1;
            }
            possibleTagPosition = substring.search(htmlEndTagRegex);
            if (possibleTagPosition > -1) {
              const matchedTag = [...substring.match(htmlEndTagRegex)];
              const tagName = matchedTag[1] || "";
              newTag = new Tag(tagName, closeTag);
              this.tagArr.push(newTag);
              input = input.slice(index + 1);
              continue loop1;
            }
          }
        }
        reachEndOfString = true;
      }
    },
    replaceSelftClosingTag: function () {
      for (let index = 0; index < this.tagArr.length; index++) {
        const currTag = this.tagArr[index];
        if (currTag.type !== selfClosingTag) {
          continue;
        }
        this.tagArr.splice(
          index,
          1,
          ...this.convertSelfClosingTagToOpenTag(currTag)
        );
        index++;
      }
    },
    convertSelfClosingTagToOpenTag: function (tag) {
      const { tagName, type, attributes, childNodes, status, id } = tag;
      const newOpenTag = new Tag(
        tagName,
        openTag,
        attributes,
        childNodes,
        status,
        id
      );
      const newCloseTag = new Tag(tagName, closeTag);
      return [newOpenTag, newCloseTag];
    },

    mapIdAndRowLevel: function (inputArr = this.tagArr) {
      inputArr[0].id = "0";
      inputArr[0].rowLevel = 0;
      for (let index = 1; index < inputArr.length; index++) {
        const currentNode = inputArr[index];
        if (currentNode.type === openTag) {
          const subArr = inputArr.slice(0, index);
          for (let j = 1; j < subArr.length + 1; j++) {
            const posibleParrentNode = subArr[subArr.length - j];
            if (
              posibleParrentNode.type === openTag &&
              posibleParrentNode.status === active
            ) {
              const previousSiblingNode = (index - (subArr.length - j) - 1) / 2;
              currentNode.id = `${posibleParrentNode.id}-${previousSiblingNode}`;
              currentNode.rowLevel = posibleParrentNode.rowLevel + 1;
              break;
            }
          }
        }
        if (currentNode.type === closeTag) {
          const subArr = inputArr.slice(0, index);
          let oppositeNode;
          for (let j = 1; j < subArr.length + 1; j++) {
            const checkingNode = inputArr[subArr.length - j];
            if (
              checkingNode.type === openTag &&
              checkingNode.status === active
            ) {
              oppositeNode = checkingNode;
              oppositeNode.status = deactive;
              currentNode.status = deactive;
              break;
            }
          }
        }
      }
    },
    generateRankedHierachy: function (inputArrr = this.tagArr) {
      let domArr = inputArrr.filter((tag) => tag.type !== closeTag);
      domArr = domArr.map((domNode) => {
        // if (
        //   domNode.attributes.class ||
        //   (domNode.attributes[":class"] &&
        //     domNode.attributes[":class"].length > 0)
        // ) {
        //   title += `${
        //     domNode.attributes.class[0] || domNode.attributes[":class"][0]
        //   }`;
        // }
        // return Object.assign(domNode, { title });
        const clonedDom = cloneDeep(domNode);
        let title = clonedDom.tagName;
        if (clonedDom.attributes.class) {
          clonedDom.attributes.class = clonedDom.attributes.class
            .replace(/["']/g, "")
            .split(/\s+/);
          if (clonedDom.attributes.class.length > 0) {
            title += `.${clonedDom.attributes.class[0]}`;
          }
        }
        return Object.assign(clonedDom, { title });
      });

      const rankedHierachy = {};
      domArr.forEach((domNode) => {
        const rowLevel = domNode.rowLevel;
        if (rankedHierachy[rowLevel]) {
          rankedHierachy[rowLevel].push(domNode);
        } else {
          rankedHierachy[rowLevel] = [domNode];
        }
      });
      this.rankedHierachy = rankedHierachy;
    },
  },
};
</script>
<style lang="scss" scoped></style>
