/* eslint-disable no-plusplus */
export const goToTop = (top = 0, behavior = 'smooth') => document.getElementById('master-page-content').scrollTo({ top, behavior }); // behavior = 'smooth' | 'auto'

export const getActorName = (refWorkflowActor, actorList) => {
  let idx = 0;
  if (refWorkflowActor.length > 1) {
    const list = refWorkflowActor.map((item) => item?.actor);
    if (list.findIndex((el) => el === 'INITIATOR_ZONA') !== -1) {
      idx = list.findIndex((el) => el === 'INITIATOR_ZONA');
    } else if (list.findIndex((el) => el.includes('PIC')) !== 1) {
      idx = list.findIndex((el) => el.includes('PIC'));
    }
  }

  return actorList[idx === -1 ? 0 : idx];
};

export const findCommonElement = (array1, array2) => {
  for (let i = 0; i < array1.length; i++) {
    for (let j = 0; j < array2.length; j++) {
      if (array1[i] === array2[j]) {
        return true;
      }
    }
  }

  return false;
};
