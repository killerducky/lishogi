import sanWriter from "./sanWriter";
import { Dests } from "../interfaces";

const keyRegex = /^[a-i][1-9]$/;
const fileRegex = /^[a-i]$/;
const crazyhouseRegex = /^\w?\*[a-i][1-9]$/;
const ambiguousPromotionCaptureRegex = /^([a-i]x?)?[a-i](1|9)$/;
const promotionRegex = /^([a-i]x?)?[a-i](1|9)=?[\+|\=]$/;

interface SubmitOpts {
  force?: boolean;
  server?: boolean;
  yourMove?: boolean;
}
type Submit = (v: string, submitOpts: SubmitOpts) => void;

window.lishogi.keyboardMove = function (opts: any) {
  if (opts.input.classList.contains("ready")) return;
  opts.input.classList.add("ready");
  let sans: any = null;

  const submit: Submit = function (v: string, submitOpts: SubmitOpts) {
    // consider 0's as O's for castling
    v = v.replace(/0/g, "O");
    const foundUci = v.length >= 2 && sans && sanToUci(v, sans);
    if (foundUci) {
      // ambiguous castle
      if (v.toLowerCase() === "o-o" && sans["O-O-O"] && !submitOpts.force)
        return;
      // ambiguous UCI
      if (v.match(keyRegex) && opts.ctrl.hasSelected()) opts.ctrl.select(v);
      // ambiguous promotion (also check sans[v] here because bc8 could mean Bc8)
      if (
        v.match(ambiguousPromotionCaptureRegex) &&
        sans[v] &&
        !submitOpts.force
      )
        return;
      else opts.ctrl.san(foundUci.slice(0, 2), foundUci.slice(2));
      clear();
    } else if (sans && v.match(keyRegex)) {
      opts.ctrl.select(v);
      clear();
    } else if (sans && v.match(fileRegex)) {
      // do nothing
    } else if (sans && v.match(promotionRegex)) {
      const foundUci = sanToUci(v.replace("=", "").slice(0, -1), sans);
      if (!foundUci) return;
      opts.ctrl.promote(
        foundUci.slice(0, 2),
        foundUci.slice(2),
        v.slice(-1).toUpperCase()
      );
      clear();
    } else if (v.match(crazyhouseRegex)) {
      if (v.length === 3) v = "P" + v;
      opts.ctrl.drop(v.slice(2), v[0].toUpperCase());
      clear();
    } else if (v.length > 0 && "clock".startsWith(v.toLowerCase())) {
      if ("clock" === v.toLowerCase()) {
        readClocks(opts.ctrl.clock());
        clear();
      }
    } else if (submitOpts.yourMove && v.length > 1) {
      setTimeout(window.lishogi.sound.error, 500);
      opts.input.value = "";
    } else {
      const wrong = v.length && sans && !sanCandidates(v, sans).length;
      if (wrong && !opts.input.classList.contains("wrong"))
        window.lishogi.sound.error();
      opts.input.classList.toggle("wrong", wrong);
    }
  };
  const clear = function () {
    opts.input.value = "";
    opts.input.classList.remove("wrong");
  };
  makeBindings(opts, submit, clear);
  return function (fen: string, dests: Dests | undefined, yourMove: boolean) {
    sans = dests && dests.size > 0 ? sanWriter(fen, destsToUcis(dests)) : null;
    submit(opts.input.value, {
      server: true,
      yourMove: yourMove,
    });
  };
};

function makeBindings(opts: any, submit: Submit, clear: Function) {
  window.Mousetrap.bind("enter", function () {
    opts.input.focus();
  });
  /* keypress doesn't cut it here;
   * at the time it fires, the last typed char
   * is not available yet. Reported by:
   * https://lishogi.org/forum/lishogi-feedback/keyboard-input-changed-today-maybe-a-bug
   */
  opts.input.addEventListener("keyup", function (e: KeyboardEvent) {
    const v = (e.target as HTMLInputElement).value;
    if (v.includes("/")) {
      focusChat();
      clear();
    } else if (v === "" && e.which == 13) opts.ctrl.confirmMove();
    else
      submit(v, {
        force: e.which === 13,
      });
  });
  opts.input.addEventListener("focus", function () {
    opts.ctrl.setFocus(true);
  });
  opts.input.addEventListener("blur", function () {
    opts.ctrl.setFocus(false);
  });
  // prevent default on arrow keys: they only replay moves
  opts.input.addEventListener("keydown", function (e: KeyboardEvent) {
    if (e.which > 36 && e.which < 41) {
      if (e.which == 37) opts.ctrl.jump(-1);
      else if (e.which == 38) opts.ctrl.jump(-999);
      else if (e.which == 39) opts.ctrl.jump(1);
      else opts.ctrl.jump(999);
      e.preventDefault();
    }
  });
}

function sanToUci(san: string, sans): Key[] | undefined {
  if (san in sans) return sans[san];
  const lowered = san.toLowerCase();
  for (let i in sans) if (i.toLowerCase() === lowered) return sans[i];
  return;
}

function sanCandidates(san: string, sans) {
  const lowered = san.toLowerCase();
  return Object.keys(sans).filter(function (s) {
    return s.toLowerCase().startsWith(lowered);
  });
}

function destsToUcis(dests: Dests) {
  const ucis: string[] = [];
  for (const [orig, d] of dests) {
    d.forEach(function (dest) {
      ucis.push(orig + dest);
    });
  }
  return ucis;
}

function focusChat() {
  const chatInput = document.querySelector(
    ".mchat .mchat__say"
  ) as HTMLInputElement;
  if (chatInput) chatInput.focus();
}

function readClocks(clockCtrl: any | undefined) {
  if (!clockCtrl) return;
  const msgs = ["sente", "gote"].map((color) => {
    const time = clockCtrl.millisOf(color);
    const date = new Date(time);
    const msg =
      (time >= 3600000
        ? simplePlural(Math.floor(time / 3600000), "hour")
        : "") +
      " " +
      simplePlural(date.getUTCMinutes(), "minute") +
      " " +
      simplePlural(date.getUTCSeconds(), "second");
    return `${color}: ${msg}`;
  });
  window.lishogi.sound.say(msgs.join(". "));
}

function simplePlural(nb: number, word: string) {
  return `${nb} ${word}${nb != 1 ? "s" : ""}`;
}
