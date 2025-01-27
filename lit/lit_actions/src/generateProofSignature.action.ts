/**
 * NAME: generateProofSignature
 */

// import { keccak256, encodePacked } from "viem";
// import crypto from "crypto";

const hashLeftRight = (left: `0x${string}`, right: `0x${string}`) => {
  // return keccak256(encodePacked(["bytes32", "bytes32"], [left, right]));
  return ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [left, right]);
};

function indexToPathIndices(index: number, treeHeight: number) {
  const binaryIndex = index.toString(2).padStart(treeHeight, "0");
  return Array.from(binaryIndex)
    .reverse()
    .map((char) => char === "0");
}

export function verifyMerkleProof(
  leaf: `0x${string}`,
  root: `0x${string}`,
  pathElements: `0x${string}`[],
  leafIndex: number,
  treeHeight: number
): boolean {
  const pathIndices = indexToPathIndices(leafIndex, treeHeight);
  let computedHash: `0x${string}` = leaf;

  for (let i = 0; i < pathElements.length; i++) {
    const sibling = pathElements[i];
    const isLeft = pathIndices[i];

    computedHash = isLeft
      ? hashLeftRight(computedHash, sibling)
      : hashLeftRight(sibling, computedHash);
  }

  return computedHash === root;
}

function circuit(privateInputs, publicInputs) {
  const { secret, nullifier, merkleProof, leafIndex } = privateInputs;
  const { treeRoot, nullifierHash, merkleTreeHeight } = publicInputs;

  const commitment = hashLeftRight(secret, nullifier);

  if (nullifierHash !== publicInputs.nullifierHash) {
    console.log("Invalid nullifier hash");
    return false;
  }
  return verifyMerkleProof(
    commitment,
    treeRoot,
    merkleProof,
    leafIndex,
    merkleTreeHeight
  );
}

const generateProofSignature = async () => {
  if (circuit(privateInputs, publicInputs)) {
    console.log("Proof verified");
    const sigShare = await LitActions.signEcdsa({
      toSign,
      publicKey,
      sigName,
    });
  } else {
    console.error("Proof not verified");
  }
};

generateProofSignature();
