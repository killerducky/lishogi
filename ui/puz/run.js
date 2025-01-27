"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCgOpts = void 0;
const util_1 = require("./util");
const fen_1 = require("shogiops/fen");
const compat_1 = require("shogiops/compat");
const makeCgOpts = (run, canMove) => {
    const cur = run.current;
    const pos = cur.position();
    return {
        fen: fen_1.makeFen(pos.toSetup()),
        orientation: run.pov,
        turnColor: pos.turn,
        movable: {
            color: run.pov,
            dests: canMove ? compat_1.shogigroundDests(pos) : undefined,
        },
        check: !!pos.isCheck(),
        lastMove: util_1.uciToLastMove(cur.lastMove()),
    };
};
exports.makeCgOpts = makeCgOpts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3JjL3J1bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxpQ0FBdUM7QUFDdkMsc0NBQXVDO0FBQ3ZDLDRDQUFtRDtBQUU1QyxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQVEsRUFBRSxPQUFnQixFQUFZLEVBQUU7SUFDakUsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQztJQUN4QixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsT0FBTztRQUNMLEdBQUcsRUFBRSxhQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzNCLFdBQVcsRUFBRSxHQUFHLENBQUMsR0FBRztRQUNwQixTQUFTLEVBQUUsR0FBRyxDQUFDLElBQUk7UUFDbkIsT0FBTyxFQUFFO1lBQ1AsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMseUJBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7U0FDbkQ7UUFDRCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7UUFDdEIsUUFBUSxFQUFFLG9CQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3hDLENBQUM7QUFDSixDQUFDLENBQUM7QUFkVyxRQUFBLFVBQVUsY0FjckIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSdW4gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQ29uZmlnIGFzIENnQ29uZmlnIH0gZnJvbSAnc2hvZ2lncm91bmQvY29uZmlnJztcbmltcG9ydCB7IHVjaVRvTGFzdE1vdmUgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgbWFrZUZlbiB9IGZyb20gJ3Nob2dpb3BzL2Zlbic7XG5pbXBvcnQgeyBzaG9naWdyb3VuZERlc3RzIH0gZnJvbSAnc2hvZ2lvcHMvY29tcGF0JztcblxuZXhwb3J0IGNvbnN0IG1ha2VDZ09wdHMgPSAocnVuOiBSdW4sIGNhbk1vdmU6IGJvb2xlYW4pOiBDZ0NvbmZpZyA9PiB7XG4gIGNvbnN0IGN1ciA9IHJ1bi5jdXJyZW50O1xuICBjb25zdCBwb3MgPSBjdXIucG9zaXRpb24oKTtcbiAgcmV0dXJuIHtcbiAgICBmZW46IG1ha2VGZW4ocG9zLnRvU2V0dXAoKSksXG4gICAgb3JpZW50YXRpb246IHJ1bi5wb3YsXG4gICAgdHVybkNvbG9yOiBwb3MudHVybixcbiAgICBtb3ZhYmxlOiB7XG4gICAgICBjb2xvcjogcnVuLnBvdixcbiAgICAgIGRlc3RzOiBjYW5Nb3ZlID8gc2hvZ2lncm91bmREZXN0cyhwb3MpIDogdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgY2hlY2s6ICEhcG9zLmlzQ2hlY2soKSxcbiAgICBsYXN0TW92ZTogdWNpVG9MYXN0TW92ZShjdXIubGFzdE1vdmUoKSksXG4gIH07XG59O1xuIl19