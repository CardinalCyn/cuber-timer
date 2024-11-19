import { DEBUG } from "./debug";
import { mathlib } from "./mathlib";

const grouplib = (function (rn) {
  function SchreierSims(gen, shuffle) {
    if (gen.sgs) {
      this.copy(gen);
      return;
    }
    this.sgs = [];
    this.sgsi = [];
    this.t2i = [];
    this.i2t = [];
    this.keyIdx = [];
    this.Tk = [];
    this.e = [];
    const n = gen[0].length;
    for (let i = 0; i < n; i++) {
      this.e[i] = i;
    }
    for (let i = 0; i < n; i++) {
      this.sgs.push([]);
      this.sgsi.push([]);
      this.t2i.push([]);
      this.i2t.push([i]);
      this.Tk.push([]);
      this.sgs[i][i] = this.e;
      this.sgsi[i][i] = this.e;
      this.t2i[i][i] = 0;
    }
    this.extend(gen, shuffle);
    // for minkwitz algorithm
    // this.invMap = {};
    // this.gen = gen;
  }

  SchreierSims.prototype.extend = function (gen, shuffle) {
    for (let i = 0; i < gen.length; i++) {
      let g = gen[i];
      if (shuffle) {
        g = this.permMult(this.permMult(this.permInv(shuffle), g), shuffle);
      }
      this.knutha(gen[0].length - 1, g);
    }
  };

  SchreierSims.prototype.copy = function (obj) {
    this.sgs = [];
    this.sgsi = [];
    this.t2i = [];
    this.i2t = [];
    this.keyIdx = obj.keyIdx.slice();
    this.Tk = [];
    this.e = obj.e;
    const n = this.e.length;
    for (let i = 0; i < n; i++) {
      this.sgs[i] = obj.sgs[i].slice();
      this.sgsi[i] = obj.sgsi[i].slice();
      this.t2i[i] = obj.t2i[i].slice();
      this.i2t[i] = obj.i2t[i].slice();
      this.Tk[i] = obj.Tk[i].slice();
    }
  };

  SchreierSims.prototype.permMult = function (permA, permB) {
    const ret = [];
    for (let i = 0; i < permA.length; i++) {
      ret[i] = permB[permA[i]];
    }
    return ret;
  };

  SchreierSims.prototype.toKeyIdx = function (perm) {
    const ret = [];
    perm = perm || this.e;
    for (let i = 0; i < this.keyIdx.length; i++) {
      ret[i] = perm[this.keyIdx[i]];
    }
    return ret;
  };

  SchreierSims.prototype.permInv = function (perm) {
    const ret = [];
    for (let i = 0; i < perm.length; i++) {
      ret[perm[i]] = i;
    }
    return ret;
  };

  SchreierSims.prototype.permCmp = function (perm1, perm2) {
    if (perm1.length !== perm2.length) {
      return perm1.length - perm2.length;
    }
    for (let i = 0; i < perm1.length; i++) {
      if (perm1[i] !== perm2[i]) {
        return perm1[i] - perm2[i];
      }
    }
    return 0;
  };

  SchreierSims.prototype.isMember = function (p, depth) {
    depth = depth || 0;
    let idx = 0;
    const ps = [];
    for (let i = p.length - 1; i >= depth; i--) {
      let j = p[i];
      for (let k = 0; k < ps.length; k++) {
        j = ps[k][j];
      }
      if (j !== i) {
        if (!this.sgs[i][j]) {
          return -1;
        }
        ps.push(this.sgsi[i][j]);
      }
      idx = idx * this.i2t[i].length + this.t2i[i][j];
    }
    return idx;
  };

  SchreierSims.prototype.isSubgroupMemberByKey = function (permKey, sgsH) {
    let idx = 0;
    const ps = [];
    for (let ii = 0; ii < this.keyIdx.length; ii++) {
      const i = this.keyIdx[ii];
      let j = permKey[ii];
      for (let k = 0; k < ps.length; k++) {
        j = ps[k][j];
      }
      if (j !== i) {
        if (!sgsH.sgs[i][j]) {
          return -1;
        }
        ps.push(sgsH.sgsi[i][j]);
      }
      idx = idx * sgsH.i2t[i].length + sgsH.t2i[i][j];
    }
    return idx;
  };

  SchreierSims.prototype.knutha = function (k, p) {
    this.Tk[k].push(p);
    for (let i = 0; i < this.sgs[k].length; i++) {
      if (this.sgs[k][i]) {
        this.knuthb(k, this.permMult(this.sgs[k][i], p));
      }
    }
  };

  SchreierSims.prototype.knuthb = function (k, p) {
    const j = p[k];
    if (!this.sgs[k][j]) {
      this.sgs[k][j] = p;
      this.sgsi[k][j] = this.permInv(p);
      this.t2i[k][j] = this.i2t[k].length;
      this.i2t[k].push(j);
      if (this.i2t[k].length === 2) {
        this.keyIdx.push(k);
        this.keyIdx.sort(function (a, b) {
          return b - a;
        });
      }
      for (let i = 0; i < this.Tk[k].length; i++) {
        this.knuthb(k, this.permMult(p, this.Tk[k][i]));
      }
      return;
    }
    const p2 = this.permMult(p, this.sgsi[k][j]);
    if (this.isMember(p2) < 0) {
      this.knutha(k - 1, p2);
    }
  };

  SchreierSims.prototype.size = function () {
    const n = this.sgs.length;
    let size = 1;
    for (let j = 0; j < n; j++) {
      let cnt = 0;
      for (let k = 0; k < n; k++) {
        if (this.sgs[j][k]) {
          cnt++;
        }
      }
      size *= cnt;
    }
    return size;
  };

  SchreierSims.prototype.minElem = function (p, depth) {
    p = this.permInv(p);
    for (let ii = 0; ii < this.keyIdx.length; ii++) {
      const i = this.keyIdx[ii];
      let maxi = p[i];
      let j = i;
      for (let k = 1; k < this.i2t[i].length; k++) {
        const m = this.i2t[i][k];
        if (p[m] > maxi) {
          maxi = p[m];
          j = m;
        }
      }
      if (j !== i) {
        p = this.permMult(this.sgs[i][j], p);
      }
    }
    return this.permInv(p);
  };

  SchreierSims.prototype.rndElem = function () {
    let perm = this.e.slice();
    for (let i = this.e.length - 1; i >= 0; i--) {
      let cnt = 0;
      let p = 0;
      for (let j = 0; j <= i; j++) {
        if (!this.sgs[i][j]) {
          continue;
        }
        if (rn(++cnt) < 1) {
          p = j;
        }
      }
      if (p !== i) {
        perm = this.permMult(perm, this.sgsi[i][p]);
      }
    }
    return perm;
  };

  /*
	SchreierSims.prototype.minkwitz = function() {
		var words = [];
		var maxl = 8;
		var toFill = 0;
		var newDelay = 3;
		this.words = [];
		this.isNew = [];
		for (var i = 0; i < this.e.length; i++) {
			this.words[i] = [];
			this.words[i][i] = [];
			this.isNew[i] = [];
			for (var j = 0; j < i; j++) {
				if (this.sgs[i][j] && !this.words[i][j]) {
					this.words[i][j] = null;
					toFill++;
				}
			}
		}

		this.invMap = {};
		for (var i = 0; i < this.gen.length; i++) {
			var g = this.gen[i];
			for (var j = i; j < this.gen.length; j++) {
				var isEq = true;
				for (var k = 0; k < this.e.length; k++) {
					if (g[this.gen[j][k]] != k) {
						isEq = false;
						break;
					}
				}
				if (isEq) {
					this.invMap[i] = j;
					this.invMap[j] = i;
				}
			}
			if (this.invMap[i] == undefined) {
				this.invMap[i] = ~i;
				this.invMap[~i] = i;
			}
		}

		var addWords = function(p, words) {
			var ret = -1;
			for (var i = p.length - 1; i >= 0; i--) {
				var j = p[i];
				if (!this.sgs[i][j]) {
					return -2;
				}
				if (!this.words[i][j]) {
					this.words[i][j] = words;
					this.isNew[i][j] = newDelay;
					this.sgs[i][j] = p;
					this.sgsi[i][j] = this.permInv(p);
					return 1;
				}
				if (words.length < this.words[i][j].length) {
					var _p = this.sgs[i][j];
					this.sgs[i][j] = p;
					this.sgsi[i][j] = this.permInv(p);
					p = _p;
					var _words = this.words[i][j];
					this.words[i][j] = words;
					this.isNew[i][j] = newDelay;
					words = _words;
					ret = 0;
				}
				if (words.length + this.words[i][j].length > maxl) {
					return ret;
				}
				p = this.permMult(p, this.sgsi[i][j]);
				for (var k = this.words[i][j].length - 1; k >= 0; k--) {
					words.push(this.invMap[this.words[i][j][k]]);
				}
			}
		}

		var iterGens = function(p, remain, func) {
			if (remain <= 0) {
				return func.call(this, p, words);
			}
			for (var i = 0; i < this.gen.length && toFill > 0; i++) {
				words.push(i);
				var ret = iterGens.call(this, this.permMult(p, this.gen[i]), remain - 1, func);
				words.pop();
				if (ret < 0) { // no improve
					continue;
				}
				words.push(this.invMap[i]);
				iterGens.call(this, this.permMult(p, this.permInv(this.gen[i])), remain - 1, func);
				words.pop();
			}
		}

		var improve = function() {
			var n = 0;
			var newCnt = 0;
			for (var i1 = 0; i1 < this.e.length; i1++) {
				for (var j1 = 0; j1 < i1; j1++) {
					if (this.isNew[i1][j1] > 0) {
						this.isNew[i1][j1]--;
					}
					if (this.isNew[i1][j1]) {
						newCnt++;
					}
				}
			}
			console.log('newCnt', newCnt);
			for (var i1 = 0; i1 < this.e.length; i1++) {
				var isFilled = true;
				for (var j1 = 0; j1 < i1; j1++) {
					if (this.sgs[i1][j1] && !this.words[i1][j1]) {
						isFilled = false;
						break;
					}
				}
				for (var j1 = 0; j1 < i1; j1++) {
					if (!this.words[i1][j1]) {
						continue;
					}
					for (var i2 = i1; i2 < this.e.length; i2++) {
						if (isFilled && i1 != i2) {
							continue;
						}
						for (var j2 = (i1 == i2 ? j1 : 0); j2 < i2; j2++) {
							if (!this.words[i2][j2]) {
								continue;
							}
							var cuml = this.words[i1][j1].length + this.words[i2][j2].length;
							if (cuml > maxl) {
								continue;
							}
							if (this.isNew[i1][j1] == 0 && this.isNew[i2][j2] == 0 && i1 == i2) {
								continue;
							}
							var cc = this.sgs[i1][j1][this.sgs[i2][j2][i1]];
							if (this.words[i1][cc] && this.words[i1][cc].length < cuml * 1.5 && i1 != i2) {
								continue;
							}
							var ret = addWords.call(this,
								this.permMult(this.sgs[i2][j2], this.sgs[i1][j1]),
								this.words[i2][j2].concat(this.words[i1][j1])
							);
							if (ret > -1) {
								n++;
							}
							if (ret > 0) {
								toFill--;
							}
							// console.log(i1, i2, ret);
						}
					}
				}
			}
			return n;
		}
		var start = $.now();
		var cnt = 0;
		for (var i = 1; i < 100 && toFill > 0; i++) {
			iterGens.call(this, this.e, i, function(p, words) {
				var ret = addWords.call(this, p, words.slice());
				cnt++;
				if (ret > 0) {
					toFill--;
				}
				if (cnt % 1000 == 0) {
					var ret2 = improve.call(this);
					maxl = Math.round(maxl * 1.25);
					console.log(ret2, toFill, maxl);
				}
				return ret;
			});
		}
		console.log('final', $.now() - start);
		improve.call(this);
		console.log('init minkwitz', $.now() - start);
		window.sgs1 = this;
	}

	SchreierSims.prototype.getGen = function(p) {
		var ret = [];
		for (var i = p.length - 1; i >= 0; i--) {
			var j = p[i];
			if (!this.sgs[i][j]) {
				return null;
			}
			if (j !== i) {
				p = this.permMult(p, this.sgsi[i][j]);
				ret.push(this.words[i][j]);
			}
		}
		return ret.reverse();
	}

	SchreierSims.prototype.intersect = function(other, thres) {
		if (this.size() > other.size()) {
			return other.intersect(this, thres);
		}
		thres = thres || 100000;
		var ret = new SchreierSims([this.sgs[0][0]]);
		var n = this.sgs.length;
		ret.cnt = 0;
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < i; j++) {
				if (!this.sgs[i][j] || ret.sgs[i][j]) {
					continue;
				}
				// console.log(i, j);
				this.enumDFS(i - 1, this.sgs[i][j], function(perm) {
					ret.knutha(n - 1, perm);
					// console.log(i, j, ret.size(), perm);
					return true;
				}, function(depth, perm) {
					if (ret.cnt > thres || ret.cnt == -1) {
						ret.cnt = -1;
						return false;
					}
					ret.cnt++;
					var mchk = other.isMember(perm, depth);
					if (!mchk) {
						return false;
					}
					for (var i = 0; i < ret.sgs[depth].length - 1; i++) {
						if (ret.sgs[depth][i]) {
							var pp = ret.permMult(perm, ret.sgs[depth][i]);
							if (pp[depth] < perm[depth]) {
								return false;
							}
						}
					}
					return true;
				});
				if (ret.cnt == -1) {
					return ret;
				}
			}
		}
		return ret;
	}

	SchreierSims.prototype.enumDFS = function(depth, perm, callback, checkFunc) {
		if (checkFunc && !checkFunc(depth + 1, perm)) {
			return;
		}
		if (depth == 0) {
			return callback(perm);
		}
		for (var j = 0; j <= depth; j++) {
			if (this.sgs[depth][j]) {
				var ret = this.enumDFS(depth - 1, this.permMult(this.sgs[depth][j], perm), callback, checkFunc);
				if (ret) {
					// console.log(depth, j, this.sgs[depth][j])
					return ret;
				}
			}
		}
	}

	SchreierSims.prototype.enum = function(callback) {
		this.enumDFS(this.sgs.length - 1, this.sgs[0][0], callback);
	}
	*/

  function CanonSeqGen(gens) {
    this.gens = gens;
    this.glen = gens.length;
    this.trieNodes = [null];
    this.trieNodes.push([]);
    this.skipSeqs = [];
  }

  CanonSeqGen.prototype.permMult = function (permA, permB) {
    const ret = [];
    for (let i = 0; i < permA.length; i++) {
      ret[i] = permB[permA[i]];
    }
    return ret;
  };

  CanonSeqGen.prototype.addSkipSeq = function (seq) {
    this.skipSeqs.push(seq.slice());
    let node = 1;
    for (let i = 0; i < seq.length; i++) {
      let next = ~~this.trieNodes[node][seq[i]];
      if (next === -1) {
        return;
      }
      if (i === seq.length - 1) {
        this.trieNodes[node][seq[i]] = -1;
        break;
      }
      if (next <= 0) {
        // empty node, create a new node
        next = this.trieNodes.length;
        this.trieNodes.push([]);
        this.trieNodes[node][seq[i]] = next;
        for (let m = 0; m < this.glen; m++) {
          this.updateNext(seq.slice(0, i + 1).concat(m));
        }
      }
      node = next;
    }
  };

  CanonSeqGen.prototype.traversalTrie = function (node, seq, callback) {
    if (node <= 0) {
      return;
    }
    for (let i = 0; i < this.glen; i++) {
      seq.push(i);
      this.traversalTrie(~~this.trieNodes[node][i], seq, callback);
      seq.pop();
    }
    callback(node, seq);
  };

  CanonSeqGen.prototype.updateNext = function (seq) {
    let node = 1;
    for (let i = 0; i < seq.length; i++) {
      let next = ~~this.trieNodes[node][seq[i]];
      if (next === 0) {
        next = this.updateNext(seq.slice(1, i + 1));
        next = next > 0 ? ~next : next;
        this.trieNodes[node][seq[i]] = next;
      }
      if (next === -1) {
        return -1;
      } else if (next < 0) {
        next = ~next;
      }
      node = next;
    }
    return node;
  };

  CanonSeqGen.prototype.refillNext = function () {
    // clear next nodes
    this.traversalTrie(
      1,
      [],
      function (node, seq) {
        for (let i = 0; i < this.glen; i++) {
          const next = ~~this.trieNodes[node][i];
          if (next !== -1 && next <= node) {
            // skip or to sub-trie
            this.trieNodes[node][i] = 0;
          }
        }
      }.bind(this),
    );
    // calculate next nodes
    this.traversalTrie(
      1,
      [],
      function (node, seq) {
        for (let i = 0; i < this.glen; i++) {
          if ((i & 0x1f) === 0) {
            this.trieNodes[node][this.glen + (i >> 5)] = 0;
          }
          const next = ~~this.trieNodes[node][i];
          if (next !== -1 && next <= node) {
            // skip or to sub-trie
            this.updateNext(seq.concat(i));
          }
          if (~~this.trieNodes[node][i] === -1) {
            this.trieNodes[node][this.glen + (i >> 5)] |= 1 << (i & 0x1f);
          }
        }
      }.bind(this),
    );
  };

  CanonSeqGen.prototype.countSeq = function (depth) {
    let counts = [0, 1];
    const ret = [1];
    for (let d = 0; d < depth; d++) {
      const newCounts = [];
      let depthCnt = 0;
      for (let node = 1; node < this.trieNodes.length; node++) {
        const curCount = counts[node] || 0;
        if (curCount === 0) {
          continue;
        }
        for (let i = 0; i < this.glen; i++) {
          let next = ~~this.trieNodes[node][i];
          if (next !== -1) {
            next = next < 0 ? ~next : next;
            newCounts[next] = (newCounts[next] || 0) + curCount;
            depthCnt += curCount;
          }
        }
      }
      counts = newCounts;
      ret.push(depthCnt);
    }
    return ret;
  };

  CanonSeqGen.prototype.countSeqMove = function (depth, moveTable, initState) {
    let counts = [];
    counts[initState * this.trieNodes.length + 1 - 1] = 1;
    const ret = [];
    for (let d = 0; d < depth; d++) {
      const newCounts = [];
      const depthCnts = [];
      let depthCnt = 0;
      for (let state = 0; state < moveTable[0].length; state++) {
        for (let node = 1; node < this.trieNodes.length; node++) {
          const curCount =
            counts[state * this.trieNodes.length + node - 1] || 0;
          if (curCount === 0) {
            continue;
          }
          for (let i = 0; i < this.glen; i++) {
            let next = ~~this.trieNodes[node][i];
            if (next !== -1) {
              next = next < 0 ? ~next : next;
              const newState = moveTable[i][state];
              const idx = newState * this.trieNodes.length + next - 1;
              newCounts[idx] = (newCounts[idx] || 0) + curCount;
              depthCnts[newState] = (depthCnts[newState] || 0) + curCount;
              depthCnt += curCount;
            }
          }
        }
      }
      counts = newCounts;
      ret.push(depthCnts, depthCnt);
    }
    return ret;
  };

  CanonSeqGen.prototype.initTrie = function (depth) {
    this.trieNodes = [null];
    this.trieNodes.push([]);
    this.refillNext();
    const e = [];
    for (let i = 0; i < this.gens[0].length; i++) {
      e[i] = i;
    }
    const visited = new Map();
    for (let seqlen = 0; seqlen <= depth; seqlen++) {
      this.searchSkip(e, seqlen, [], 1, visited);
      this.refillNext();
    }
  };

  CanonSeqGen.prototype.searchSkip = function (perm, maxl, seq, node, visited) {
    if (maxl === 0) {
      const key = String.fromCharCode.apply(null, perm);
      if (visited.has(key)) {
        // console.log('find skip seq', seq, 'replaced by', visited.get(key));
        this.addSkipSeq(seq);
      } else {
        visited.set(key, seq.slice());
      }
      return;
    }
    for (let i = 0; i < this.glen; i++) {
      let next = this.trieNodes[node][i];
      if (next === -1) {
        continue;
      } else if (next < 0) {
        next = ~next;
      }
      const gen = this.gens[i];
      const permNew = this.permMult(gen, perm);
      seq.push(i);
      this.searchSkip(permNew, maxl - 1, seq, next, visited);
      seq.pop();
    }
  };

  /*
	CanonSeqGen.prototype.finalize = function() {
		var diff = [];
		for (var i = 1; i < this.trieNodes.length; i++) {
			diff[i] = [];
		}
		var changed = true;
		while (changed) {
			changed = false;
			for (var node1 = 1; node1 < this.trieNodes.length; node1++) {
				for (var node2 = 1; node2 < node1; node2++) {
					if (diff[node1][node2]) {
						continue;
					}
					for (var i = 0; i < this.glen; i++) {
						var next1 = ~~this.trieNodes[node1][i];
						var next2 = ~~this.trieNodes[node2][i];
						if (next1 == -1 && next2 == -1) {
							continue;
						}
						if ((next1 == -1) != (next2 == -1)) {
							diff[node1][node2] = true;
							changed = true;
							break;
						}
						next1 ^= next1 >> 31;
						next2 ^= next2 >> 31;
						if (next1 != next2 && diff[Math.max(next1, next2)][Math.min(next1, next2)]) {
							diff[node1][node2] = true;
							changed = true;
							break;
						}
					}
				}
			}
		}
		var nodeMap = [0];
		var idx = 1;
		for (var i = 1; i < this.trieNodes.length; i++) {
			nodeMap[i] = i;
			for (var j = 1; j < i; j++) {
				if (!diff[i][j]) {
					nodeMap[i] = nodeMap[j];
				}
			}
			if (nodeMap[i] == i) {
				nodeMap[i] = idx;
				idx++;
			}
		}
		for (var node = 1; node < this.trieNodes.length; node++) {
			for (var i = 0; i < this.glen; i++) {
				var next = ~~this.trieNodes[node][i];
				var old = next ^ (next >> 31);
				this.trieNodes[node][i] = nodeMap[old] ^ (next >> 31);
			}
		}
		for (var i = 1; i < this.trieNodes.length; i++) {
			this.trieNodes[nodeMap[i]] = this.trieNodes[i];
		}
		while (this.trieNodes.length > idx) {
			this.trieNodes.pop();
		}
		console.log(diff, nodeMap, idx);
	}
	*/

  function SubgroupSolver(genG, genH, genM) {
    //assert <genH>  <=  <genM>  <=  <genG>
    this.genG = genG;
    this.genH = genH;
    this.genM = genM;
    if (!genH) {
      const e = [];
      for (let i = 0; i < genG[0].length; i++) {
        e[i] = i;
      }
      this.genH = [e];
    }
  }

  SubgroupSolver.prototype.permHash = function (perm) {
    return String.fromCharCode.apply(null, perm);
  };

  SubgroupSolver.prototype.midCosetHash = function (perm) {
    return this.sgsM == null
      ? this.sgsG.isMember(this.sgsG.permInv(perm), this.sgsMdepth)
      : this.permHash(this.sgsM.minElem(perm));
  };

  SubgroupSolver.prototype.initTables = function (maxCosetSize) {
    if (this.coset2idx) {
      return;
    }
    maxCosetSize = maxCosetSize || 100000;

    this.sgsH = new SchreierSims(this.genH);
    this.sgsG = new SchreierSims(this.sgsH);
    this.sgsG.extend(this.genG);
    const cosetSize = this.sgsG.size() / this.sgsH.size();
    this.isCosetSearch = this.sgsH.size() > 1;

    let midCosetSize = 1;
    if (this.genM) {
      this.sgsM = new SchreierSims(this.genM);
      midCosetSize = this.sgsG.size() / this.sgsM.size();
    } else if (this.sgsH.size() === 1) {
      this.sgsM = null;
      this.sgsMdepth = 0;
      for (let i = this.sgsG.e.length - 1; i >= 0; i--) {
        if (midCosetSize * this.sgsG.i2t[i].length > maxCosetSize) {
          break;
        }
        this.sgsMdepth = i;
        midCosetSize *= this.sgsG.i2t[i].length;
      }
    } else if (cosetSize <= maxCosetSize) {
      // subgroup <H>
      this.sgsM = new SchreierSims(this.genH);
      midCosetSize = cosetSize;
    } else {
      // trivial subgroup <G>
      this.sgsM = null;
      this.sgsMdepth = this.sgsG.e.length;
    }
    this.clen = midCosetSize;
    DEBUG &&
      console.log(
        "[Subgroup Solver] coset space:",
        cosetSize,
        "mid coset size:",
        midCosetSize,
      );

    this.genEx = [];
    this.genExi = [];
    this.genExMap = [];
    const genExSet = new Map();
    genExSet.set(this.permHash(this.sgsG.e), -1);
    for (let i = 0; i < this.genG.length; i++) {
      let perm = this.genG[i];
      let pow = 1;
      while (true) {
        const key = this.permHash(perm);
        if (genExSet.has(key)) {
          break;
        }
        genExSet.set(key, this.genEx.length);
        this.genEx.push(perm);
        this.genExi.push(this.sgsG.permInv(perm));
        this.genExMap.push([i, pow]);
        perm = this.sgsG.permMult(this.genG[i], perm);
        pow++;
      }
    }
    this.glen = this.genEx.length;
    for (let i = 0; i < this.glen; i++) {
      const genInv = this.sgsG.permInv(this.genEx[i]);
      this.genExMap[i][2] = genExSet.get(this.permHash(genInv));
    }

    this.canon = new CanonSeqGen(this.genEx);
    this.canon.initTrie(2);
    this.canoni = new CanonSeqGen(this.genEx);
    for (let i = 0; i < this.canon.skipSeqs.length; i++) {
      const seq = this.canon.skipSeqs[i].slice();
      seq.reverse();
      for (let j = 0; j < seq.length; j++) {
        seq[j] = this.genExMap[seq[j]][2];
      }
      this.canoni.addSkipSeq(seq);
    }
    this.canoni.refillNext();

    // move table, {coset <=> representative} for G/M
    this.moveTable = [];
    this.idx2coset = [this.sgsG.e];
    this.coset2idx = {};
    this.coset2idx[this.midCosetHash(this.sgsG.e)] = 0;
    // const sumPrun = 0;
    for (let i = 0; i < this.idx2coset.length; i++) {
      if (i >= midCosetSize) {
        console.log("ERROR!");
        break;
      }
      const perm = this.idx2coset[i];
      for (let j = 0; j < this.glen; j++) {
        if (this.genExMap[j][1] !== 1) {
          continue;
        }
        const newp = this.sgsG.permMult(this.genEx[j], perm);
        const key = this.midCosetHash(newp);
        if (!(key in this.coset2idx)) {
          this.coset2idx[key] = this.idx2coset.length;
          this.idx2coset.push(newp);
        }
        this.moveTable[i * this.glen + j] = this.coset2idx[key];
      }
    }
    let stdMove = null;
    for (let j = 0; j < this.glen; j++) {
      if (this.genExMap[j][1] === 1) {
        stdMove = j;
        continue;
      }
      for (let i = 0; i < this.clen; i++) {
        this.moveTable[i * this.glen + j] =
          this.moveTable[
            this.moveTable[i * this.glen + j - 1] * this.glen + stdMove
          ];
      }
    }
    this.prunTable = this.initPrunTable(this.sgsG.e);
    DEBUG &&
      console.log(
        "[Subgroup Solver] prun table size:",
        this.prunTable[0].length,
      );
  };

  SubgroupSolver.prototype.idaMidSearch = function (
    pidx,
    maxl,
    lm,
    trieNodes,
    moves,
    curPerm,
    insertPerm,
    prunTable,
    callback,
  ) {
    const nodePrun = prunTable[0][pidx];
    if (nodePrun > maxl) {
      return false;
    }
    if (maxl === 0) {
      if (pidx >= this.clen) {
        moves.push(-1);
        const newPerm = this.sgsG.permMult(curPerm, insertPerm);
        const ret = callback(moves, newPerm);
        moves.pop();
        return ret;
      }
      return callback(moves, curPerm);
    }

    if (pidx >= this.clen && lm !== 0) {
      const newpidx = prunTable[3][pidx - this.clen];
      moves.push(-1);
      const newPerm = this.sgsG.permMult(curPerm, insertPerm);
      const ret = this.idaMidSearch(
        newpidx,
        maxl,
        1,
        trieNodes,
        moves,
        newPerm,
        insertPerm,
        prunTable,
        callback,
      );
      moves.pop();
      if (ret) {
        return ret;
      }
    }

    const node = trieNodes[lm || 1];
    const glenBase = pidx * ((this.glen + 31) >> 5);

    for (let mbase = 0; mbase < this.glen; mbase += 32) {
      let mask = node[this.glen + (mbase >> 5)];
      mask |=
        nodePrun >= maxl - 1
          ? prunTable[nodePrun - maxl + 2][glenBase + (mbase >> 5)]
          : 0;
      mask =
        ~mask & (this.glen - mbase >= 32 ? -1 : (1 << (this.glen - mbase)) - 1);
      while (mask !== 0) {
        let midx = 31 - Math.clz32(mask);
        mask -= 1 << midx;
        midx += mbase;

        const cidx = pidx % this.clen;
        const newpidx = this.moveTable[cidx * this.glen + midx] + pidx - cidx;
        // if (DEBUG && prunTable[0][newpidx] >= maxl) {
        // 	debugger;
        // }
        const nextCanon = node[midx];
        moves.push(midx);
        const newPerm = this.sgsG.permMult(curPerm, this.genExi[midx]);
        const ret = this.idaMidSearch(
          newpidx,
          maxl - 1,
          nextCanon ^ (nextCanon >> 31),
          trieNodes,
          moves,
          newPerm,
          insertPerm,
          prunTable,
          callback,
        );
        moves.pop();
        if (ret) {
          return ret;
        }
      }
    }
    return false;
  };

  SubgroupSolver.prototype.initPrunTable = function (perm, allowPre) {
    const pidx = this.coset2idx[this.midCosetHash(perm)];
    const prunTable = [];
    const fartherMask = [];
    const nocloserMask = [];
    const maskBase = (this.glen + 31) >> 5;
    for (let i = 0; i < this.clen; i++) {
      prunTable[i] = -1;
    }
    const permMove = [];
    if (allowPre) {
      for (let i = 0; i < this.clen; i++) {
        prunTable.push(-1, -1);
        permMove[i] =
          this.coset2idx[
            this.midCosetHash(this.sgsG.permMult(perm, this.idx2coset[i]))
          ];
        permMove[permMove[i] + this.clen] = i;
      }
      prunTable[0] = 0;
    } else {
      prunTable[pidx] = 0;
    }
    let fill = 1;
    let lastfill = 0;
    let curDepth = 0;
    while (fill !== lastfill) {
      lastfill = fill;
      for (let idx = 0; idx < prunTable.length; idx++) {
        if (prunTable[idx] !== curDepth) {
          continue;
        }
        const cidx = idx % this.clen;
        const midx = idx - cidx; // 0 - normal, 1 - after perm inserted, 2 - after permi inserted
        for (let m = 0; m < this.glen; m++) {
          const newIdx = this.moveTable[cidx * this.glen + m] + midx;
          let newPrun = prunTable[newIdx];
          if (prunTable[newIdx] === -1) {
            prunTable[newIdx] = curDepth + 1;
            newPrun = curDepth + 1;
            fill++;
          }
          if (newPrun > curDepth) {
            fartherMask[idx * maskBase + (m >> 5)] |= 1 << (m & 0x1f);
          }
          if (newPrun >= curDepth) {
            nocloserMask[idx * maskBase + (m >> 5)] |= 1 << (m & 0x1f);
          }
        }
        if (!allowPre || midx !== 0) {
          continue;
        }
        // insert perm/permi
        for (let m = 0; m < 2; m++) {
          const newIdx =
            permMove[cidx + (1 - m) * this.clen] + (m + 1) * this.clen;
          if (prunTable[newIdx] === -1) {
            prunTable[newIdx] = curDepth;
            fill++;
          }
        }
      }
      curDepth++;
    }
    return [prunTable, fartherMask, nocloserMask, permMove, curDepth];
  };

  // 0 - normal, 1 - solved, 2 - unsolvable
  SubgroupSolver.prototype.checkPerm = function (perm) {
    this.initTables();
    if (this.sgsH.isMember(perm) >= 0) {
      return 1;
    } else if (this.sgsG.isMember(perm) < 0) {
      return 2;
    } else {
      return 0;
    }
  };

  SubgroupSolver.ONLY_IDA = 0x1;
  SubgroupSolver.ALLOW_PRE = 0x2;

  SubgroupSolver.prototype.DissectionSolve = function (
    perm,
    maxl,
    mask,
    solCallback,
  ) {
    // const tt = performance.now();
    this.initTables();
    // DEBUG && console.log('[Subgroup Solver] finished init tables, tt=', performance.now() - tt);
    if (this.sgsG.isMember(perm) < 0) {
      console.log("[Subgroup Solver] NOT A MEMBER OF G");
      return;
    }
    let pidx = this.coset2idx[this.midCosetHash(perm)];
    if (!pidx && pidx !== 0) {
      console.log("[Subgroup Solver] ERROR!");
      return;
    }
    const onlyIDA = (mask & SubgroupSolver.ONLY_IDA) !== 0;
    const allowPre =
      (mask & SubgroupSolver.ALLOW_PRE) !== 0 && this.isCosetSearch;
    let ret = null;
    let prunTable1 = this.prunTable;
    let prunTable2 = null;
    if (allowPre) {
      prunTable2 = this.initPrunTable(perm, allowPre);
      prunTable1 = prunTable2;
      pidx = this.clen;
    }
    for (let depth = prunTable1[0][pidx]; depth <= maxl; depth++) {
      // let s1tot = 0;
      // let s2tot = 0;
      const permi = this.sgsG.permInv(perm);
      if (onlyIDA || depth <= this.prunTable[4]) {
        ret = this.idaMidSearch(
          allowPre ? this.clen : pidx,
          depth,
          1,
          this.canon.trieNodes,
          [],
          this.sgsG.toKeyIdx(allowPre ? null : permi),
          permi,
          prunTable1,
          function (moves, permKey) {
            // s1tot++;
            if (this.sgsG.isSubgroupMemberByKey(permKey, this.sgsH) < 0) {
              return;
            }
            const solution = [];
            for (let i = 0; i < moves.length; i++) {
              solution.push(
                moves[i] === -1 ? -1 : this.genExMap[moves[i]].slice(0, 2),
              );
            }
            return solCallback ? solCallback(solution) : solution;
          }.bind(this),
        );
        if (ret) {
          return ret;
        }
        continue;
      }
      const mid = ~~(depth / 2);
      if (!prunTable2) {
        prunTable2 = this.initPrunTable(perm, allowPre);
      }
      const preSize = allowPre ? 2 : 1;
      // let mpcnt = 0;
      const mpsizes = [];
      for (let mpidx = 0; mpidx < this.clen * preSize; mpidx++) {
        //pidx at mid == mpidx
        const mpidx1 = mpidx;
        const mpidx2 =
          mpidx +
          (allowPre ? (mpidx >= this.clen ? -this.clen : this.clen * 2) : 0);
        if (
          prunTable1[0][mpidx1] > mid ||
          prunTable2[0][mpidx2] > depth - mid
        ) {
          continue;
        }
        // mpcnt++;

        // search from mpidx to 0
        const visited = new Map();
        let size1 = 0;
        let size2 = 0;
        const perm0 = this.isCosetSearch ? this.sgsG.e : this.sgsG.toKeyIdx();
        this.idaMidSearch(
          mpidx1,
          mid,
          0,
          this.canon.trieNodes,
          [],
          perm0,
          permi,
          prunTable1,
          function (moves, permKey) {
            let key;
            if (this.isCosetSearch) {
              const permRep = this.sgsH.minElem(permKey);
              key = this.permHash(permRep);
            } else {
              key = this.permHash(permKey);
            }
            size1++;
            const sols1h = visited.get(key) || [];
            sols1h.push(moves.slice());
            visited.set(key, sols1h);
          }.bind(this),
        );

        //search from mpidx to pidx
        ret = this.idaMidSearch(
          mpidx2,
          depth - mid,
          1,
          this.canoni.trieNodes,
          [],
          perm0,
          perm,
          prunTable2,
          function (moves, permKey) {
            // mp * move2 = perm, mp * move1 = I  =>  perm * move2' * move1 = I  =>  move1 = move2 * perm'
            const finalPermKey = allowPre
              ? permKey
              : this.sgsG.permMult(permKey, perm);
            let key;
            if (this.isCosetSearch) {
              const permRep = this.sgsH.minElem(finalPermKey);
              key = this.permHash(permRep);
            } else {
              key = this.permHash(finalPermKey);
            }

            size2++;
            if (visited.has(key)) {
              const sols2h = [];
              let node = 1;
              for (let i = 0; i < moves.length; i++) {
                let move = moves[moves.length - 1 - i];
                move = move === -1 ? -1 : this.genExMap[move][2];
                node = move === -1 ? 1 : this.canon.trieNodes[node][move];
                // if (DEBUG && node === -1) {
                // 	debugger;
                // }
                node ^= node >> 31;
                sols2h.push(move === -1 ? -1 : this.genExMap[move].slice(0, 2));
              }
              const sols1h = visited.get(key);
              for (let i = 0; i < sols1h.length; i++) {
                const solution = sols2h.slice();
                let node2 = node;
                for (let j = 0; j < sols1h[i].length; j++) {
                  const move = sols1h[i][j];
                  node2 = move === -1 ? 1 : this.canon.trieNodes[node2][move];
                  if (node2 === -1) {
                    break;
                  }
                  node2 ^= node2 >> 31;
                  solution.push(
                    move === -1 ? -1 : this.genExMap[move].slice(0, 2),
                  );
                }
                if (node2 === -1) {
                  continue;
                }
                const chk = solCallback ? solCallback(solution) : solution;
                if (chk) {
                  return chk;
                }
              }
            }
          }.bind(this),
        );
        mpsizes.push([mpidx, size1, size2]);
        // s1tot += size1;
        // s2tot += size2;
        if (ret) {
          break;
        }
      }
      if (ret) {
        break;
      }
    }
    return ret;
  };

  SubgroupSolver.prototype.godsAlgo = function (depth) {
    this.initTables();
    let stateCnt = 0;
    for (let i = 0; i < this.clen; i++) {
      // const perm = this.idx2coset[i];
      const visited = new Set();
      for (let maxl = 0; maxl <= depth; maxl++) {
        const perm0 = this.isCosetSearch ? this.sgsG.e : this.sgsG.toKeyIdx();
        this.idaMidSearch(
          i,
          maxl,
          1,
          this.canon.trieNodes,
          [],
          perm0,
          null,
          this.prunTable,
          function (moves, permKey) {
            let key;
            if (this.isCosetSearch) {
              const permRep = this.sgsH.minElem(permKey);
              key = this.permHash(permRep);
            } else {
              key = this.permHash(permKey);
            }
            if (!visited.has(key)) {
              stateCnt++;
              visited.add(key);
            }
          }.bind(this),
        );
      }
    }
    return stateCnt;
  };

  return {
    CanonSeqGen,
    SchreierSims,
    SubgroupSolver,
  };
})(mathlib.rn);

export { grouplib };
