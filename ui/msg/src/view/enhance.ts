import { scroller } from "./scroller";

// looks like it has a @mention or a url.tld
export const isMoreThanText = (str: string) => /(\n|(@|\.)\w{2,})/.test(str);

export const enhance = (str: string) =>
  expandMentions(expandUrls(window.lishogi.escapeHtml(str))).replace(
    /\n/g,
    "<br>"
  );

const expandMentions = (html: string) =>
  html.replace(
    /(^|[^\w@#/])@([\w-]{2,})/g,
    (orig: string, prefix: string, user: string) =>
      user.length > 20 ? orig : `${prefix}${a("/@/" + user, "@" + user)}`
  );

// ported from https://github.com/bryanwoods/autolink-js/blob/master/autolink.js
const urlRegex = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:(?:https?|ftp):\/\/|lishogi\.org)[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
const expandUrls = (html: string) =>
  html.replace(
    urlRegex,
    (_, space: string, url: string) => `${space}${expandUrl(url)}`
  );

const expandUrl = (url: string) =>
  expandImgur(url) || expandGiphy(url) || expandImage(url) || expandLink(url);

const imgurRegex = /https?:\/\/(?:i\.)?imgur\.com\/(\w+)(?:\.jpe?g|\.png|\.gif)?/;
const expandImgur = (url: string) =>
  imgurRegex.test(url)
    ? url.replace(imgurRegex, (_, id) => aImg(`https://i.imgur.com/${id}.jpg`))
    : undefined;

const giphyRegex = /https:\/\/(?:media\.giphy\.com\/media\/|giphy\.com\/gifs\/(?:\w+-)*)(\w+)(?:\/giphy\.gif)?/;
const expandGiphy = (url: string) =>
  giphyRegex.test(url)
    ? url.replace(giphyRegex, (_, id) =>
        aImg(`https://media.giphy.com/media/${id}/giphy.gif`)
      )
    : undefined;

const expandImage = (url: string) =>
  /\.(jpg|jpeg|png|gif)$/.test(url) ? aImg(url) : undefined;

const expandLink = (url: string) => a(url, url.replace(/^https?:\/\//, ""));

const a = (href: string, body: string) =>
  `<a target="_blank" href="${
    href.startsWith("/") || href.includes("://") ? href : "//" + href
  }">${body}</a>`;

const img = (src: string) => `<img src="${src}"/>`;

const aImg = (src: string) => a(src, img(src));

/* now with the iframe expansion */

interface Expandable {
  element: HTMLElement;
  link: Link;
}
interface Link {
  type: LinkType;
  src: string;
}
type LinkType = "game";

const domain = window.location.host;
const gameRegex = new RegExp(
  `(?:https?://)${domain}/(?:embed/)?(\\w{8})(?:(?:/(sente|gote))|\\w{4}|)(#\\d+)?$`
);
const notGames = [
  "training",
  "analysis",
  "insights",
  "practice",
  "features",
  "password",
  "streamer",
];

export function expandIFrames(el: HTMLElement) {
  const expandables: Expandable[] = [];

  el.querySelectorAll("a:not(.text)").forEach((a: HTMLAnchorElement) => {
    const link = parseLink(a);
    if (link)
      expandables.push({
        element: a,
        link: link,
      });
  });

  expandGames(expandables.filter((e) => e.link.type == "game"));
}

function expandGames(games: Expandable[]): void {
  if (games.length < 3) games.forEach(expand);
  else
    games.forEach((game) => {
      game.element.title = "Click to expand";
      game.element.classList.add("text");
      game.element.setAttribute("data-icon", "=");
      game.element.addEventListener("click", (e) => {
        if (e.button === 0) {
          e.preventDefault();
          expand(game);
        }
      });
    });
}

function expand(exp: Expandable): void {
  const $iframe: any = $("<iframe>").attr("src", exp.link.src);
  $(exp.element).parent().parent().addClass("has-embed");
  $(exp.element).replaceWith($('<div class="embed"></div>').html($iframe));
  return $iframe
    .on("load", function (this: HTMLIFrameElement) {
      if (this.contentDocument?.title.startsWith("404"))
        (this.parentNode as HTMLElement).classList.add("not-found");
      scroller.auto();
    })
    .on("mouseenter", function (this: HTMLIFrameElement) {
      $(this).focus();
    });
}

function parseLink(a: HTMLAnchorElement): Link | undefined {
  const [id, pov, ply] = Array.from(a.href.match(gameRegex) || []).slice(1);
  if (id && !notGames.includes(id))
    return {
      type: "game",
      src: configureSrc(`/embed/${id}${pov ? `/${pov}` : ""}${ply || ""}`),
    };
  return undefined;
}

const themes = [
  "solid-orange",
  "solid-natural",
  "wood1",
  "kaya1",
  "kaya2",
  "kaya-light",
  "oak",
  "solid-brown1",
  "solid-wood1",
  "blue",
  "dark-blue",
  "gray",
  "Painting1",
  "Painting2",
  "Kinkaku",
  "space1",
  "space2",
  "whiteBoard",
  "darkBoard",
  "doubutsu"
];

function configureSrc(url: string): string {
  if (url.includes("://")) return url;
  const parsed = new URL(url, window.location.href);
  parsed.searchParams.append(
    "theme",
    themes.find((theme) => document.body.classList.contains(theme)) ?? "wood1"
  );
  parsed.searchParams.append("bg", document.body.getAttribute("data-theme")!);
  return parsed.href;
}
