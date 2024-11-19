import { grouplib } from "./grouplib";
import { gsolver } from "./gsolver";
import { min2phase } from "./search";
function subsetScramble(moves) {
  const search = new min2phase.Search();
  const subsetSGSs = {};
  const key = moves.join("|");
  if (!subsetSGSs[key]) {
    const gens = [];
    for (let m = 0; m < moves.length; m++) {
      const perm = [];
      for (let i = 0; i < 54; i++) {
        perm[i] = i + 32;
      }
      const moved = gsolver.rubiksCube.move(
        String.fromCharCode.apply(null, perm),
        moves[m],
      );
      for (let i = 0; i < 54; i++) {
        perm[i] = moved.charCodeAt(i) - 32;
      }
      gens.push(perm);
    }
    subsetSGSs[key] = new grouplib.SchreierSims(gens);
  }
  let solution = "";
  // console.log(subsetSGSs[key]);
  do {
    const state = subsetSGSs[key].rndElem();
    for (let i = 0; i < state.length; i++) {
      state[i] = "URFDLB".charAt(~~(state[i] / 9));
    }
    solution = search.solution(state.join(""), 21, 1e9, 50, 2);
  } while (solution.length <= 3);
  return solution.replace(/ +/g, " ");
}

export { subsetScramble };
