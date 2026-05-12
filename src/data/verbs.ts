export type VerbPattern = 'A-A-A' | 'A-B-A' | 'A-B-B' | 'A-B-C' | 'A-A-B';

import { VerbStat } from '../types';

export interface Verb {
  id: string;
  japanese: string;
  base: string;
  past: string;
  pastParticiple: string;
  pattern: VerbPattern;
  example: string;
}

export const verbs: Verb[] = [
  { id: '1', japanese: '～である、いる', base: 'be(am,is,are)', past: 'was/were', pastParticiple: 'been', pattern: 'A-B-C', example: 'I am a student. (私は学生です)' },
  { id: '2', japanese: '見る', base: 'see', past: 'saw', pastParticiple: 'seen', pattern: 'A-B-C', example: 'I saw a bird. (鳥を見ました)' },
  { id: '3', japanese: '来る', base: 'come', past: 'came', pastParticiple: 'come', pattern: 'A-B-A', example: 'He came here. (彼はここに来ました)' },
  { id: '4', japanese: '～になる', base: 'become', past: 'became', pastParticiple: 'become', pattern: 'A-B-A', example: 'She became a doctor. (彼女は医者になりました)' },
  { id: '5', japanese: '行く', base: 'go', past: 'went', pastParticiple: 'gone', pattern: 'A-B-C', example: 'I went to school. (学校に行きました)' },
  { id: '6', japanese: '持っている', base: 'have', past: 'had', pastParticiple: 'had', pattern: 'A-B-B', example: 'I had a pen. (ペンを持っていました)' },
  { id: '7', japanese: '持つ、つかむ', base: 'hold', past: 'held', pastParticiple: 'held', pattern: 'A-B-B', example: 'He held my hand. (彼は私の手を握りました)' },
  { id: '8', japanese: '与える', base: 'give', past: 'gave', pastParticiple: 'given', pattern: 'A-B-C', example: 'She gave me a book. (彼女は私に本をくれました)' },
  { id: '9', japanese: '隠す', base: 'hide', past: 'hid', pastParticiple: 'hidden', pattern: 'A-B-C', example: 'I hid the key. (鍵を隠しました)' },
  { id: '10', japanese: '乗る', base: 'ride', past: 'rode', pastParticiple: 'ridden', pattern: 'A-B-C', example: 'I rode a bike. (自転車に乗りました)' },
  { id: '11', japanese: '切る', base: 'cut', past: 'cut', pastParticiple: 'cut', pattern: 'A-A-A', example: 'I cut my hair. (髪を切りました)' },
  { id: '12', japanese: '話す', base: 'speak', past: 'spoke', pastParticiple: 'spoken', pattern: 'A-B-C', example: 'She spoke English. (彼女は英語を話しました)' },
  { id: '13', japanese: '盗む', base: 'steal', past: 'stole', pastParticiple: 'stolen', pattern: 'A-B-C', example: 'My bag was stolen. (カバンが盗まれました)' },
  { id: '14', japanese: '取る、連れて行く', base: 'take', past: 'took', pastParticiple: 'taken', pattern: 'A-B-C', example: 'I took a picture. (写真を撮りました)' },
  { id: '15', japanese: '置く', base: 'put', past: 'put', pastParticiple: 'put', pattern: 'A-A-A', example: 'I put it on the desk. (それを机の上に置きました)' },
  { id: '16', japanese: '描く、引く', base: 'draw', past: 'drew', pastParticiple: 'drawn', pattern: 'A-B-C', example: 'I drew a picture. (絵を描きました)' },
  { id: '17', japanese: '落ちる', base: 'fall', past: 'fell', pastParticiple: 'fallen', pattern: 'A-B-C', example: 'The apple fell. (リンゴが落ちました)' },
  { id: '18', japanese: '買う', base: 'buy', past: 'bought', pastParticiple: 'bought', pattern: 'A-B-B', example: 'I bought a car. (車を買いました)' },
  { id: '19', japanese: '捕まえる', base: 'catch', past: 'caught', pastParticiple: 'caught', pattern: 'A-B-B', example: 'I caught a cold. (風邪をひきました)' },
  { id: '20', japanese: '教える', base: 'teach', past: 'taught', pastParticiple: 'taught', pattern: 'A-B-B', example: 'He taught me math. (彼は私に数学を教えました)' },
  { id: '21', japanese: '食べ物を与える', base: 'feed', past: 'fed', pastParticiple: 'fed', pattern: 'A-B-B', example: 'I fed the dog. (犬にエサをやりました)' },
  { id: '22', japanese: '禁じる', base: 'forbid', past: 'forbade', pastParticiple: 'forbidden', pattern: 'A-B-C', example: 'Smoking is forbidden. (喫煙は禁じられています)' },
  { id: '23', japanese: '破裂する', base: 'burst', past: 'burst', pastParticiple: 'burst', pattern: 'A-A-A', example: 'The balloon burst. (風船が破裂しました)' },
  { id: '24', japanese: '費用がかかる', base: 'cost', past: 'cost', pastParticiple: 'cost', pattern: 'A-A-A', example: 'It cost 1000 yen. (1000円かかりました)' },
  { id: '25', japanese: '打つ', base: 'hit', past: 'hit', pastParticiple: 'hit', pattern: 'A-A-A', example: 'He hit the ball. (彼はボールを打ちました)' },
  { id: '26', japanese: '凍る', base: 'freeze', past: 'froze', pastParticiple: 'frozen', pattern: 'A-B-C', example: 'The water froze. (水が凍りました)' },
  { id: '27', japanese: '目を覚ます', base: 'wake', past: 'woke', pastParticiple: 'woken', pattern: 'A-B-C', example: 'I woke up early. (早く起きました)' },
  { id: '28', japanese: '振る', base: 'shake', past: 'shook', pastParticiple: 'shaken', pattern: 'A-B-C', example: 'We shook hands. (私たちは握手しました)' },
  { id: '29', japanese: '打ち負かす', base: 'beat', past: 'beat', pastParticiple: 'beaten', pattern: 'A-A-B', example: 'Our team beat them. (私たちのチームは彼らを打ち負かしました)' },
  { id: '30', japanese: '噛む', base: 'bite', past: 'bit', pastParticiple: 'bitten', pattern: 'A-B-C', example: 'The dog bit me. (犬が私を噛みました)' },
  { id: '31', japanese: '傷つける', base: 'hurt', past: 'hurt', pastParticiple: 'hurt', pattern: 'A-A-A', example: 'My leg hurts. (足が痛みます)' },
  { id: '32', japanese: '～させる', base: 'let', past: 'let', pastParticiple: 'let', pattern: 'A-A-A', example: 'Let me go. (私を行かせてください)' },
  { id: '33', japanese: '閉める', base: 'shut', past: 'shut', pastParticiple: 'shut', pattern: 'A-A-A', example: 'Please shut the door. (ドアを閉めてください)' },
  { id: '34', japanese: '吹く', base: 'blow', past: 'blew', pastParticiple: 'blown', pattern: 'A-B-C', example: 'The wind blew hard. (風が強く吹きました)' },
  { id: '35', japanese: '飛ぶ', base: 'fly', past: 'flew', pastParticiple: 'flown', pattern: 'A-B-C', example: 'The bird flew away. (鳥が飛んでいきました)' },
  { id: '36', japanese: '戦う', base: 'fight', past: 'fought', pastParticiple: 'fought', pattern: 'A-B-B', example: 'They fought bravely. (彼らは勇敢に戦いました)' },
  { id: '37', japanese: '考える', base: 'think', past: 'thought', pastParticiple: 'thought', pattern: 'A-B-B', example: 'I thought so too. (私もそう思いました)' },
  { id: '38', japanese: '建てる', base: 'build', past: 'built', pastParticiple: 'built', pattern: 'A-B-B', example: 'They built a house. (彼らは家を建てました)' },
  { id: '39', japanese: '夢を見る', base: 'dream', past: 'dreamt', pastParticiple: 'dreamt', pattern: 'A-B-B', example: 'I dreamt about you. (あなたの夢を見ました)' },
  { id: '40', japanese: '感じる', base: 'feel', past: 'felt', pastParticiple: 'felt', pattern: 'A-B-B', example: 'I felt happy. (幸せを感じました)' },
  { id: '41', japanese: '横たえる、置く', base: 'lay', past: 'laid', pastParticiple: 'laid', pattern: 'A-B-B', example: 'She laid the baby on the bed. (彼女は赤ちゃんをベッドに寝かせました)' },
  { id: '42', japanese: '導く', base: 'lead', past: 'led', pastParticiple: 'led', pattern: 'A-B-B', example: 'He led the team. (彼はチームを導きました)' },
  { id: '43', japanese: '横たわる', base: 'lie', past: 'lay', pastParticiple: 'lain', pattern: 'A-B-C', example: 'I lay on the grass. (私は草の上に横たわりました)' },
  { id: '44', japanese: '作る', base: 'make', past: 'made', pastParticiple: 'made', pattern: 'A-B-B', example: 'I made a cake. (ケーキを作りました)' },
  { id: '45', japanese: '支払う', base: 'pay', past: 'paid', pastParticiple: 'paid', pattern: 'A-B-B', example: 'I paid by card. (カードで支払いました)' },
  { id: '46', japanese: '読む', base: 'read', past: 'read', pastParticiple: 'read', pattern: 'A-A-A', example: 'I read a book. (本を読みました)' },
  { id: '47', japanese: '言う', base: 'say', past: 'said', pastParticiple: 'said', pattern: 'A-B-B', example: 'She said yes. (彼女ははいと言いました)' },
  { id: '48', japanese: '持ってくる', base: 'bring', past: 'brought', pastParticiple: 'brought', pattern: 'A-B-B', example: 'I brought my umbrella. (傘を持ってきました)' },
  { id: '49', japanese: '食べる', base: 'eat', past: 'ate', pastParticiple: 'eaten', pattern: 'A-B-C', example: 'I ate sushi. (寿司を食べました)' },
  { id: '50', japanese: '忘れる', base: 'forget', past: 'forgot', pastParticiple: 'forgotten', pattern: 'A-B-C', example: 'I forgot his name. (彼の名前を忘れました)' },
  { id: '51', japanese: '上がる', base: 'rise', past: 'rose', pastParticiple: 'risen', pattern: 'A-B-C', example: 'The sun rose. (太陽が昇りました)' },
  { id: '52', japanese: '書く', base: 'write', past: 'wrote', pastParticiple: 'written', pattern: 'A-B-C', example: 'I wrote a letter. (手紙を書きました)' },
  { id: '53', japanese: '見つける', base: 'find', past: 'found', pastParticiple: 'found', pattern: 'A-B-B', example: 'I found my keys. (鍵を見つけました)' },
  { id: '54', japanese: '失う', base: 'lose', past: 'lost', pastParticiple: 'lost', pattern: 'A-B-B', example: 'I lost my wallet. (財布をなくしました)' },
  { id: '55', japanese: '得る', base: 'get', past: 'got', pastParticiple: 'gotten', pattern: 'A-B-C', example: 'I got a present. (プレゼントをもらいました)' },
  { id: '56', japanese: '火をつける', base: 'light', past: 'lit', pastParticiple: 'lit', pattern: 'A-B-B', example: 'He lit a fire. (彼は火をつけました)' },
];

export const calculateWeaknessScore = (verb: Verb, stats: Record<string, VerbStat>) => {
  const stat = stats[verb.id];
  const total = stat?.total || 0;
  const correct = stat?.correct || 0;
  const incorrect = total - correct;
  
  // 1. Base Weakness: Laplace smoothed error rate
  // Handes 0/0 smoothly (50%), 0/5 is extremely weak (~85%)
  const baseWeakness = (incorrect + 1) / (total + 2);

  // 2. Frequency Penalty: Heavily penalize words that are frequently answered incorrectly
  const frequencyPenalty = Math.log10(incorrect + 1) * 0.15;

  // 3. Pattern Difficulty Factor: A-B-C is generally harder than A-A-A
  let patternDifficulty = 0;
  switch (verb.pattern) {
    case 'A-B-C': patternDifficulty = 0.05; break;
    case 'A-B-A': patternDifficulty = 0.03; break;
    case 'A-A-B': patternDifficulty = 0.03; break;
    case 'A-B-B': patternDifficulty = 0.01; break;
    case 'A-A-A': patternDifficulty = 0.0; break;
  }

  // 4. Unpracticed Bonus: Prioritize words that have never been seen
  const unpracticedBonus = total === 0 ? 0.1 : 0;

  // 5. Manual Weak Mark
  const manualWeakBonus = stat?.isManualWeak ? 100 : 0;

  // 6. Random Jitter: Add slight randomness (±2%) to break ties and keep tests fresh
  const jitter = (Math.random() - 0.5) * 0.04;

  return baseWeakness + frequencyPenalty + patternDifficulty + unpracticedBonus + manualWeakBonus + jitter;
};

export const getFilteredVerbs = (
  count: number,
  filter: string,
  stats: Record<string, VerbStat>
): Verb[] => {
  const isEndless = count === 0;
  const finalCount = isEndless ? 1000 : count;
  let filtered = [...verbs];
  
  if (filter === 'weak') {
    // Supercharged Weakness Prediction Algorithm
    filtered.sort((a, b) => {
      const scoreA = calculateWeaknessScore(a, stats);
      const scoreB = calculateWeaknessScore(b, stats);
      return scoreB - scoreA; // Sort descending (highest weakness first)
    });
    
    // In 'weak' mode, we take the top weakest ones. 
    // For endless mode, take the top 30.
    const sliceCount = isEndless ? Math.min(30, filtered.length) : finalCount;
    filtered = filtered.slice(0, sliceCount);
  } else if (filter !== 'all') {
    filtered = filtered.filter(v => v.pattern === filter);
  }
  
  let result: Verb[] = [];
  while (result.length < finalCount) {
    let batch = [...filtered].sort(() => 0.5 - Math.random());
    if (batch.length === 0) {
      batch = [...verbs].sort(() => 0.5 - Math.random());
    }
    result.push(...batch);
  }
  
  return result.slice(0, finalCount);
};

export const generateDummyOptions = (verb: Verb, targetForm: 'past' | 'pastParticiple'): string[] => {
  const dummies: string[] = [];
  
  if (verb.base.endsWith('e')) {
    dummies.push(verb.base + 'd');
  } else if (verb.base.endsWith('y')) {
    dummies.push(verb.base.slice(0, -1) + 'ied');
  } else {
    dummies.push(verb.base + 'ed');
  }

  dummies.push(verb.base + (verb.base.endsWith('s') || verb.base.endsWith('sh') || verb.base.endsWith('ch') || verb.base.endsWith('o') ? 'es' : 's'));

  if (targetForm === 'pastParticiple') {
    if (verb.past.endsWith('t')) {
      dummies.push(verb.past + 'en');
    } else {
      dummies.push(verb.past + 'n');
    }
  }

  const otherVerbs = verbs.filter(v => v.id !== verb.id);
  const randomOther = otherVerbs[Math.floor(Math.random() * otherVerbs.length)];
  dummies.push(randomOther[targetForm]);

  const uniqueDummies = Array.from(new Set(dummies)).filter(d => d !== verb[targetForm]);
  
  while (uniqueDummies.length < 3) {
    const randomOther = otherVerbs[Math.floor(Math.random() * otherVerbs.length)];
    const dummy = randomOther[targetForm];
    if (!uniqueDummies.includes(dummy) && dummy !== verb[targetForm]) {
      uniqueDummies.push(dummy);
    }
  }

  return uniqueDummies.slice(0, 3);
};
