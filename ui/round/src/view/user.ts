import { h } from "snabbdom";
import { Player } from "game";
import { Position } from "../interfaces";
import RoundController from "../ctrl";

export function aiName(ctrl: RoundController, level: number) {
  return ctrl.trans("aiNameLevelAiLevel", "Engine", level);
}

export function userHtml(
  ctrl: RoundController,
  player: Player,
  position: Position
) {
  const d = ctrl.data,
    user = player.user,
    perf = user ? user.perfs[d.game.perf] : null,
    rating = player.rating ? player.rating : perf && perf.rating,
    rd = player.ratingDiff,
    ratingDiff =
      rd === 0
        ? h("span", "±0")
        : rd && rd > 0
        ? h("good", "+" + rd)
        : rd && rd < 0
        ? h("bad", "−" + -rd)
        : undefined;

  if (user) {
    const connecting = !player.onGame && ctrl.firstSeconds && user.online;
    return h(
      `div.ruser-${position}.ruser.user-link`,
      {
        class: {
          online: player.onGame,
          offline: !player.onGame,
          long: user.username.length > 16,
          connecting,
        },
      },
      [
        h(
          `div.player-color.${player.color}`,
          {
            attrs: {
              title: player.color === "sente" ? "Sente" : "Gote",
            },
          },
          []
        ),
        h("i.line" + (user.patron ? ".patron" : ""), {
          attrs: {
            title: connecting
              ? "Connecting to the game"
              : player.onGame
              ? "Joined the game"
              : "Left the game",
          },
        }),
        h(
          "a.text.ulpt",
          {
            attrs: {
              "data-pt-pos": "s",
              href: "/@/" + user.username,
              target: ctrl.isPlaying() ? "_blank" : "_self",
            },
          },
          user.title
            ? [
                h(
                  "span.title",
                  user.title == "BOT" ? { attrs: { "data-bot": true } } : {},
                  user.title
                ),
                " ",
                user.username,
              ]
            : [user.username]
        ),
        rating ? h("rating", rating + (player.provisional ? "?" : "")) : null,
        ratingDiff,
        player.engine
          ? h("span", {
              attrs: {
                "data-icon": "j",
                title: ctrl.trans.noarg("thisAccountViolatedTos"),
              },
            })
          : null,
      ]
    );
  }
  const connecting = !player.onGame && ctrl.firstSeconds;
  return h(
    `div.ruser-${position}.ruser.user-link`,
    {
      class: {
        online: player.onGame,
        offline: !player.onGame,
        connecting,
      },
    },
    [
      h(
        `div.player-color.${player.color}`,
        {
          attrs: {
            title: player.color === "sente" ? "Sente" : "Gote",
          },
        },
        []
      ),
      h("i.line", {
        attrs: {
          title: connecting
            ? "Connecting to the game"
            : player.onGame
            ? "Joined the game"
            : "Left the game",
        },
      }),
      h("name", player.name || "Anonymous"),
    ]
  );
}

export function userTxt(ctrl: RoundController, player: Player) {
  if (player.user) {
    return (
      (player.user.title ? player.user.title + " " : "") + player.user.username
    );
  } else if (player.ai) return aiName(ctrl, player.ai);
  else return "Anonymous";
}
