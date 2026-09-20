export type QuoteTag = 'mamba' | 'work' | 'resilience' | 'focus' | 'learning' | 'health';

export interface Quote {
  id: string;
  text: string;
  textJa: string;
  author: string;
  authorJa: string;
  tags: QuoteTag[];
  story: string;
}

const context = (authorJa: string, focus: string): string => `${authorJa}が競技や仕事を通じて示した、${focus}についての言葉です。結果だけでなく、そこへ向かう日々の姿勢に目を向けると意味が深まります。`;

const makeQuote = (id: string, text: string, textJa: string, author: string, authorJa: string, tags: QuoteTag[], focus: string): Quote => ({
  id,
  text,
  textJa,
  author,
  authorJa,
  tags,
  story: context(authorJa, focus),
});

export const quotes: Quote[] = [
  makeQuote('kobe-01', "Everything negative—pressure, challenges—is all an opportunity for me to rise.", 'ネガティブなこと、プレッシャーも挑戦も、すべては自分が成長するチャンスだ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '逆境を成長の材料に変える姿勢'),
  makeQuote('kobe-02', 'The most important thing is to try and inspire people so that they can be great in whatever they want to do.', 'いちばん大切なのは、人が自分の望むことですばらしくなれるよう、励ますことだ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '周囲の人を高めるリーダーシップ'),
  makeQuote('kobe-03', "If you're afraid to fail, then you're probably going to fail.", '失敗を恐れているなら、おそらく失敗する。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '失敗を恐れずに挑む勇気'),
  makeQuote('kobe-04', 'The moment you give up, is the moment you let someone else win.', 'あきらめた瞬間に、誰かに勝利を渡すことになる。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '最後までやり抜く執念'),
  makeQuote('kobe-05', 'Rest at the end, not in the middle.', '休むのは途中ではなく、最後にしよう。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work', 'focus'], '積み重ねを止めない集中'),
  makeQuote('kobe-06', "Job's not finished.", '仕事はまだ終わっていない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '達成の途中で気を緩めないこと'),
  makeQuote('kobe-07', 'Those times when you get up early and you work hard, those times you stay up late and you work hard, those times when you do not feel like working—you are actually being disciplined.', '早起きして努力する時、夜遅くまで努力する時、やる気が出ないのに努力する時こそ、規律を身につけている。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '気分に左右されない規律'),
  makeQuote('kobe-08', 'The biggest mistake is not to shoot at all.', '最大の失敗は、シュートを打たないことだ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '行動しないことのリスク'),
  makeQuote('kobe-09', 'May you always remember to enjoy the road, especially when it’s a hard one.', '特に険しい道を歩く時こそ、その道のりを楽しむことを忘れないでほしい。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '苦しい過程にも意味を見つけること'),
  makeQuote('kobe-10', "We can always kind of be average and just do what's normal. I'm not in this to do what's normal.", '平均的で普通のことをする道もある。でも、自分は普通を目指しているわけではない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '平凡に甘んじない選択'),
  makeQuote('kobe-11', "I'll do whatever it takes to win games, whether it's sitting on a bench waving a towel, handing a cup of water to a teammate, or hitting the game-winning shot.", '勝つためなら何でもする。ベンチでタオルを振ることも、水を渡すことも、決勝点を決めることも同じだ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '役割を問わず勝利に貢献すること'),
  makeQuote('kobe-12', 'If you do not believe in yourself no one will do it for you.', '自分を信じなければ、誰も代わりに信じてはくれない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '自分への信頼'),
  makeQuote('kobe-13', 'Dedication makes dreams come true.', '献身的な努力が夢を現実にする。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '夢を支える継続'),
  makeQuote('kobe-14', 'The beauty in being blessed with talent is rising above doubters to create a beautiful moment.', '才能を与えられた美しさは、疑う人たちを乗り越えて、すばらしい瞬間をつくることにある。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '疑念を乗り越えて成果をつくること'),
  makeQuote('kobe-15', "I can't relate to lazy people. We don't speak the same language.", '怠ける人の気持ちはわからない。僕たちは同じ言葉を話していない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '努力を習慣にする厳しさ'),
  makeQuote('kobe-16', 'The only thing you can control is your effort.', '自分がコントロールできるのは、努力だけだ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '自分の行動に集中すること'),
  makeQuote('kobe-17', 'I don’t want to be the next Michael Jordan, I only want to be Kobe Bryant.', '次のマイケル・ジョーダンになりたいのではない。自分はコービー・ブライアントになりたい。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '他人ではなく自分の道を選ぶこと'),
  makeQuote('kobe-18', 'The topic of failure doesn’t exist.', '失敗という話題は存在しない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '失敗を学びへと捉え直すこと'),
  makeQuote('kobe-19', 'Great things come from hard work and perseverance. No excuses.', 'すばらしいものは、努力と粘り強さから生まれる。言い訳はしない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '努力と継続に責任を持つこと'),
  makeQuote('kobe-20', 'The most important thing is that your teammates have to know you’re pulling for them and you really want them to be successful.', '最も大切なのは、仲間が、自分が応援していて成功を願っていると知ることだ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '仲間の成功を願う姿勢'),
  makeQuote('kobe-21', 'Haters are a good problem to have. Nobody hates the good ones. They hate the great ones.', '嫌われることは、よい悩みだ。誰もよい選手を嫌わない。偉大な選手を嫌うのだ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '批判を成果の裏返しとして受け止めること'),
  makeQuote('kobe-22', 'Love me or hate me, they both get me energized.', '愛されても嫌われても、どちらも自分の力になる。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '外部の反応を推進力に変えること'),
  makeQuote('kobe-23', 'I don’t have to prove anything to anybody.', '誰かに証明しなければならないことはない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '他人の評価から自由になること'),
  makeQuote('kobe-24', 'Winning takes priority over all else. There is no gray area.', '勝つことが何より優先だ。曖昧な領域はない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '目的を明確にすること'),
  makeQuote('kobe-25', 'Once you know what failure feels like, determination chases success.', '失敗がどんなものか知れば、決意が成功を追いかける。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '失敗から生まれる決意'),
  makeQuote('kobe-26', 'A lot of people say they want to be great, but they’re not willing to make the sacrifices necessary to achieve greatness.', '偉大になりたいと言う人は多いが、そのために必要な犠牲を払おうとはしない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '目標に伴う代償を受け入れること'),
  makeQuote('kobe-27', 'I focus on one thing and one thing only: that’s trying to win as many championships as I can.', 'ひとつだけに集中する。できる限り多くの優勝を目指すことだ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '一点に集中すること'),
  makeQuote('kobe-28', 'The last time I was intimidated was when I was 6 years old in a karate class.', '最後に怖気づいたのは、6歳で空手のクラスにいた時だ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '恐怖に支配されない心'),
  makeQuote('kobe-29', 'I have self-doubt. I have insecurity. I have fear of failure. I have nights when I show up at the arena and I’m like, “My back hurts, my feet hurt, my knees hurt.”', '自分を疑うことも、不安も、失敗への恐れもある。それでもアリーナに立つ夜がある。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '不安を抱えたまま進む強さ'),
  makeQuote('kobe-30', 'Heroes come and go, but legends are forever.', '英雄は現れては去るが、伝説は永遠に残る。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'work'], '長く残る仕事を目指すこと'),
  makeQuote('kobe-31', 'Everything was negative—pressure, challenges. It was all an opportunity for me to rise.', 'プレッシャーも挑戦も、すべては自分が立ち上がる機会だった。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '重圧を飛躍に変えること'),
  makeQuote('kobe-32', 'The important thing is to learn from the past, use it as a guide, and move forward.', '大切なのは過去から学び、それを道しるべにして前進することだ。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'learning'], '経験を次の一歩に活かすこと'),
  makeQuote('kobe-33', 'If you are going to be a leader, you are not going to satisfy everybody.', 'リーダーになるなら、全員を満足させることはできない。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '必要な決断を引き受けること'),
  makeQuote('kobe-34', 'The moment you give up is the moment you let someone else win.', 'あきらめた瞬間に、相手に勝利を渡す。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'resilience'], '粘り強く続けること'),
  makeQuote('kobe-35', 'I create my own path. It was straight and narrow and I looked at it as in between me and everybody else.', '自分の道をつくる。その道はまっすぐで狭く、そこには自分と他のすべての人との距離があった。', 'Kobe Bryant', 'Kobe Bryant', ['mamba', 'focus'], '自分だけの道を歩くこと'),

  makeQuote('jordan-01', 'Some people want it to happen, some wish it would happen, others make it happen.', '起きてほしいと願う人もいる。起きればいいと思う人もいる。起こす人もいる。', 'Michael Jordan', 'Michael Jordan', ['work', 'focus'], '願望を行動へ変えること'),
  makeQuote('jordan-02', 'I’ve failed over and over and over again in my life. And that is why I succeed.', '人生で何度も何度も失敗した。だからこそ成功した。', 'Michael Jordan', 'Michael Jordan', ['resilience', 'work'], '失敗を成功の一部として受け入れること'),
  makeQuote('jordan-03', 'Talent wins games, but teamwork and intelligence wins championships.', '才能は試合に勝たせるが、チームワークと知性が優勝をもたらす。', 'Michael Jordan', 'Michael Jordan', ['work', 'learning'], '個人技をチームの力につなげること'),
  makeQuote('jordan-04', 'I can accept failure, everyone fails at something. But I can’t accept not trying.', '失敗は受け入れられる。誰もが何かで失敗する。でも、挑戦しないことは受け入れられない。', 'Michael Jordan', 'Michael Jordan', ['resilience', 'focus'], '挑戦することの価値'),
  makeQuote('jordan-05', 'If you accept the expectations of others, especially negative ones, then you never will change the outcome.', '他人の期待、特に否定的な期待を受け入れたら、結果を変えられない。', 'Michael Jordan', 'Michael Jordan', ['resilience', 'focus'], '他人の限界を自分の限界にしないこと'),
  makeQuote('jordan-06', 'You must expect great things of yourself before you can do them.', 'すばらしいことを成し遂げる前に、まず自分にそれを期待しなければならない。', 'Michael Jordan', 'Michael Jordan', ['focus', 'work'], '自分への期待を持つこと'),
  makeQuote('jordan-07', 'To learn to succeed, you must first learn to fail.', '成功を学ぶには、まず失敗を学ばなければならない。', 'Michael Jordan', 'Michael Jordan', ['learning', 'resilience'], '失敗から学ぶこと'),
  makeQuote('jordan-08', 'I’ve always believed that if you put in the work, the results will come.', '努力をすれば、結果はついてくるといつも信じていた。', 'Michael Jordan', 'Michael Jordan', ['work', 'focus'], '結果を急がず努力を続けること'),
  makeQuote('jordan-09', 'Limits, like fears, are often just an illusion.', '限界は、恐怖と同じで、しばしばただの幻想だ。', 'Michael Jordan', 'Michael Jordan', ['resilience', 'focus'], '思い込みの限界を越えること'),
  makeQuote('jordan-10', 'There is no such thing as a perfect basketball player, and I don’t believe there is one greatest player either.', '完璧なバスケットボール選手はいないし、唯一最高の選手がいるとも思わない。', 'Michael Jordan', 'Michael Jordan', ['learning', 'resilience'], '完璧主義から学び続けること'),

  makeQuote('ali-01', 'He who is not courageous enough to take risks will accomplish nothing in life.', 'リスクを取る勇気がない人は、人生で何も成し遂げられない。', 'Muhammad Ali', 'Muhammad Ali', ['resilience', 'focus'], '一歩踏み出す勇気'),
  makeQuote('ali-02', 'I am the greatest, I said that even before I knew I was.', '私は最高だ。そう言ったのは、そうなる前からだ。', 'Muhammad Ali', 'Muhammad Ali', ['focus', 'work'], '言葉で自分の可能性を定めること'),
  makeQuote('ali-03', 'It isn’t the mountains ahead to climb that wear you out; it’s the pebble in your shoe.', '疲れさせるのは目の前の山ではなく、靴の中の小石だ。', 'Muhammad Ali', 'Muhammad Ali', ['focus', 'resilience'], '小さな障害を取り除くこと'),
  makeQuote('ali-04', 'The man who views the world at 50 the same as he did at 20 has wasted 30 years of his life.', '50歳で20歳の時と同じ世界の見方をしているなら、30年を無駄にしたことになる。', 'Muhammad Ali', 'Muhammad Ali', ['learning', 'resilience'], '経験によって見方を更新すること'),
  makeQuote('ali-05', 'Float like a butterfly, sting like a bee.', '蝶のように舞い、蜂のように刺す。', 'Muhammad Ali', 'Muhammad Ali', ['focus', 'work'], '軽やかさと鋭さを両立すること'),
  makeQuote('ali-06', 'It’s not bragging if you can back it up.', '実力で裏づけられるなら、それは自慢ではない。', 'Muhammad Ali', 'Muhammad Ali', ['work', 'focus'], '自信を準備で支えること'),

  makeQuote('ichiro-01', '小さなことを積み重ねることが、とんでもないところへ行くただひとつの道だと思っています。', '小さなことを積み重ねることが、とんでもないところへ行くただひとつの道だと思っています。', 'Ichiro Suzuki', 'イチロー', ['work', 'focus'], '小さな習慣の積み重ね'),
  makeQuote('ichiro-02', '努力せずに何かできるようになる人のことを、天才と呼ぶのだと思います。', '努力せずに何かできるようになる人のことを、天才と呼ぶのだと思います。', 'Ichiro Suzuki', 'イチロー', ['work', 'learning'], '見えない努力の価値'),
  makeQuote('ichiro-03', '夢は近づくと目標に変わる。', '夢は近づくと目標に変わる。', 'Ichiro Suzuki', 'イチロー', ['focus', 'work'], '夢を具体的な目標に変えること'),
  makeQuote('ichiro-04', '自分の思ったことをやり続けることに、後悔はありません。', '自分の思ったことをやり続けることに、後悔はありません。', 'Ichiro Suzuki', 'イチロー', ['focus', 'resilience'], '自分の決断を貫くこと'),
  makeQuote('ichiro-05', '第三者の評価は、他人の意見ですから、気にしない。', '第三者の評価は、他人の意見ですから、気にしない。', 'Ichiro Suzuki', 'イチロー', ['focus', 'resilience'], '他人の評価に振り回されないこと'),
  makeQuote('ichiro-06', '準備というのは、言い訳を排除するためにするものです。', '準備というのは、言い訳を排除するためにするものです。', 'Ichiro Suzuki', 'イチロー', ['work', 'focus'], '準備で迷いを減らすこと'),
  makeQuote('ichiro-07', '苦しみを背負いながら、毎日小さな一歩を進み続けることが、成功への近道です。', '苦しみを背負いながら、毎日小さな一歩を進み続けることが、成功への近道です。', 'Ichiro Suzuki', 'イチロー', ['resilience', 'work'], '苦しい日にも歩みを止めないこと'),
  makeQuote('ichiro-08', '壁というのは、できる人にしかやってこない。', '壁というのは、できる人にしかやってこない。', 'Ichiro Suzuki', 'イチロー', ['resilience', 'learning'], '壁を成長の証として見ること'),

  makeQuote('serena-01', 'A champion is defined not by their wins but by how they can recover when they fall.', 'チャンピオンは勝利ではなく、転んだ時にどう立ち直るかで決まる。', 'Serena Williams', 'Serena Williams', ['resilience', 'work'], '立ち直る力'),
  makeQuote('serena-02', 'The success of every woman should be the inspiration to another.', 'すべての女性の成功は、別の誰かの励みになるべきだ。', 'Serena Williams', 'Serena Williams', ['work', 'resilience'], '成功を次の人へ渡すこと'),
  makeQuote('serena-03', 'I really think a champion is defined not by their wins but by how they can recover when they fall.', 'チャンピオンとは勝利ではなく、倒れた後にどう回復するかで決まる。', 'Serena Williams', 'Serena Williams', ['resilience', 'focus'], '敗北からの回復'),
  makeQuote('serena-04', 'Every woman’s success should be an inspiration to another woman.', 'すべての女性の成功は、別の女性の励みになるべきだ。', 'Serena Williams', 'Serena Williams', ['work', 'learning'], '互いに勇気を与えること'),

  makeQuote('ohtani-01', '無理だと思われていることを、やってみたい。', '無理だと思われていることを、やってみたい。', 'Shohei Ohtani', '大谷翔平', ['work', 'resilience'], '前例のない挑戦'),
  makeQuote('ohtani-02', '誰もやったことがないことをやるのが、僕のモチベーションです。', '誰もやったことがないことをやるのが、僕のモチベーションです。', 'Shohei Ohtani', '大谷翔平', ['focus', 'work'], '未知の領域へ進むこと'),
  makeQuote('ohtani-03', '先入観は可能性を狭める。', '先入観は可能性を狭める。', 'Shohei Ohtani', '大谷翔平', ['focus', 'learning'], '思い込みを手放すこと'),

  makeQuote('hanyu-01', '努力は嘘をつく。でも無駄にはならない。', '努力は嘘をつく。でも無駄にはならない。', 'Yuzuru Hanyu', '羽生結弦', ['work', 'resilience'], '努力が残すもの'),
  makeQuote('hanyu-02', '僕はオリンピックを知っているから、オリンピックを知らない人より強い。', '僕はオリンピックを知っているから、オリンピックを知らない人より強い。', 'Yuzuru Hanyu', '羽生結弦', ['focus', 'learning'], '経験を自信に変えること'),
  makeQuote('hanyu-03', '自分の弱さを認められる人は、強い人だと思います。', '自分の弱さを認められる人は、強い人だと思います。', 'Yuzuru Hanyu', '羽生結弦', ['resilience', 'learning'], '弱さを認める勇気'),

  makeQuote('inoue-01', '努力は必ず報われるとは限らない。でも、努力しなければ報われることはない。', '努力は必ず報われるとは限らない。でも、努力しなければ報われることはない。', 'Naoya Inoue', '井上尚弥', ['work', 'resilience'], '努力を続ける理由'),
  makeQuote('inoue-02', '自分に勝つことが一番難しい。', '自分に勝つことが一番難しい。', 'Naoya Inoue', '井上尚弥', ['focus', 'resilience'], '自分との戦い'),

  makeQuote('arnold-01', 'The resistance that you fight physically in the gym and the resistance that you fight in life can only build a strong character.', 'ジムで体を使って戦う抵抗も、人生で戦う抵抗も、強い人格をつくる。', 'Arnold Schwarzenegger', 'Arnold Schwarzenegger', ['work', 'resilience', 'health'], '負荷が人格を鍛えること'),
  makeQuote('arnold-02', 'You must have a goal, a clear goal, a goal that you can visualize.', '目標を持たなければならない。明確で、思い描ける目標を。', 'Arnold Schwarzenegger', 'Arnold Schwarzenegger', ['focus', 'work'], '目標を具体化すること'),
  makeQuote('arnold-03', 'The worst thing I can be is the same as everybody else. I hate that.', '最悪なのは、他の人と同じになることだ。それが嫌いだ。', 'Arnold Schwarzenegger', 'Arnold Schwarzenegger', ['focus', 'work'], '自分らしい基準を持つこと'),

  makeQuote('goggins-01', 'When you think you are done, you are only at 40 percent of your body’s capability.', 'もう限界だと思った時、体の能力はまだ40パーセントしか使っていない。', 'David Goggins', 'David Goggins', ['resilience', 'health'], '限界の先へ進むこと'),
  makeQuote('goggins-02', 'The most important conversations you’ll ever have are the ones you’ll have with yourself.', '人生で最も大切な会話は、自分自身との会話だ。', 'David Goggins', 'David Goggins', ['focus', 'resilience'], '自分との対話'),
  makeQuote('goggins-03', 'Suffering is a test. That is all it is.', '苦しみは試験だ。それ以上でも以下でもない。', 'David Goggins', 'David Goggins', ['resilience', 'work'], '苦しさを試練として受け止めること'),

  makeQuote('duckworth-01', 'Enthusiasm is common. Endurance is rare.', '熱意はよくある。持久力はまれだ。', 'Angela Duckworth', 'Angela Duckworth', ['work', 'resilience'], '情熱を持続させること'),
  makeQuote('duckworth-02', 'Grit is living life like it’s a marathon, not a sprint.', 'やり抜く力とは、人生を短距離走ではなくマラソンとして生きることだ。', 'Angela Duckworth', 'Angela Duckworth', ['resilience', 'work'], '長期戦の視点'),
  makeQuote('duckworth-03', 'Our potential is one thing. What we do with it is quite another.', '可能性があることと、それをどう使うかは別のことだ。', 'Angela Duckworth', 'Angela Duckworth', ['focus', 'learning'], '可能性を行動に変えること'),

  makeQuote('clear-01', 'You do not rise to the level of your goals. You fall to the level of your systems.', '目標の高さまで上がるのではない。仕組みの水準まで落ちるのだ。', 'James Clear', 'James Clear', ['work', 'focus'], '目標を支える仕組み'),
  makeQuote('clear-02', 'Every action you take is a vote for the person you wish to become.', 'すべての行動は、なりたい自分への一票だ。', 'James Clear', 'James Clear', ['learning', 'focus'], '日々の行動と identity'),
  makeQuote('clear-03', 'You should be far more concerned with your current trajectory than with your current results.', '今の結果より、今どちらへ進んでいるかをずっと気にすべきだ。', 'James Clear', 'James Clear', ['work', 'resilience'], '方向を見失わないこと'),

  makeQuote('bruce-01', 'Absorb what is useful, discard what is useless and add what is specifically your own.', '役立つものを吸収し、役立たないものを捨て、自分だけのものを加えよ。', 'Bruce Lee', 'Bruce Lee', ['learning', 'focus'], '学びを自分の形にすること'),
  makeQuote('bruce-02', 'Knowing is not enough, we must apply. Willing is not enough, we must do.', '知るだけでは足りない。応用しなければならない。意欲だけでは足りない。行動しなければならない。', 'Bruce Lee', 'Bruce Lee', ['learning', 'work'], '知識を行動に変えること'),
  makeQuote('bruce-03', 'A goal is not always meant to be reached, it often serves simply as something to aim at.', '目標は必ずしも到達するためだけのものではない。目指す方向になることも多い。', 'Bruce Lee', 'Bruce Lee', ['focus', 'learning'], '目標が示す方向'),

  makeQuote('musashi-01', '千日の稽古を鍛とし、万日の稽古を錬とす。', '千日の稽古を鍛とし、万日の稽古を錬とす。', 'Miyamoto Musashi', '宮本武蔵', ['work', 'focus'], '長い鍛錬の価値'),
  makeQuote('musashi-02', '身を浅く思ひ、世を深く思ふ。', '身を浅く思い、世を深く思う。', 'Miyamoto Musashi', '宮本武蔵', ['focus', 'learning'], '自分を軽く、世界を深く見ること'),
  makeQuote('musashi-03', '道を広く知り、物毎に少しも迷ひたる事なし。', '道を広く知り、物事に少しも迷うことがない。', 'Miyamoto Musashi', '宮本武蔵', ['learning', 'focus'], '広く学び迷いを減らすこと'),

  makeQuote('matsushita-01', '失敗したところでやめてしまうから失敗になる。成功するところまで続ければ、それは成功になる。', '失敗したところでやめてしまうから失敗になる。成功するところまで続ければ、それは成功になる。', 'Konosuke Matsushita', '松下幸之助', ['resilience', 'work'], '続けることで意味を変えること'),
  makeQuote('matsushita-02', '無理に売るな。客の欲しがるものを作れ。', '無理に売るな。客の欲しがるものを作れ。', 'Konosuke Matsushita', '松下幸之助', ['focus', 'learning'], '相手の本当の需要を見ること'),
  makeQuote('matsushita-03', '青春とは心の若さである。信念と希望にあふれ、勇気にみちて日に新たな活動を続けるかぎり、青春は永遠にその人のものである。', '青春とは心の若さである。信念と希望にあふれ、勇気を持って新しい活動を続ける限り、青春は永遠にその人のものだ。', 'Konosuke Matsushita', '松下幸之助', ['resilience', 'health'], '心の若さを保つこと'),

  makeQuote('inamori-01', '人生・仕事の結果＝考え方×熱意×能力', '人生・仕事の結果＝考え方×熱意×能力。', 'Kazuo Inamori', '稲盛和夫', ['work', 'focus'], '考え方と熱意の掛け算'),
  makeQuote('inamori-02', 'ど真剣にやる。', 'ど真剣にやる。', 'Kazuo Inamori', '稲盛和夫', ['work', 'focus'], '目の前の仕事への本気'),

  makeQuote('honda-01', '成功とは99パーセントの失敗に支えられた1パーセントだ。', '成功とは99パーセントの失敗に支えられた1パーセントだ。', 'Soichiro Honda', '本田宗一郎', ['resilience', 'work'], '失敗の積み重ねが成功を支えること'),
  makeQuote('honda-02', '人間、生まれてきたからには、何か一つでいいから世の中のために役立つことをして死にたい。', '人間、生まれてきたからには、何か一つでいいから世の中のために役立つことをして死にたい。', 'Soichiro Honda', '本田宗一郎', ['work', 'focus'], '社会に役立つ仕事'),

  makeQuote('jobs-01', 'The only way to do great work is to love what you do.', 'すばらしい仕事をする唯一の方法は、自分のすることを愛することだ。', 'Steve Jobs', 'Steve Jobs', ['work', 'focus'], '仕事への情熱'),
  makeQuote('jobs-02', 'Stay hungry, stay foolish.', 'ハングリーであれ。愚かであれ。', 'Steve Jobs', 'Steve Jobs', ['learning', 'focus'], '好奇心を失わないこと'),
  makeQuote('jobs-03', 'Your time is limited, so don’t waste it living someone else’s life.', '時間は限られている。だから誰かの人生を生きて無駄にしてはいけない。', 'Steve Jobs', 'Steve Jobs', ['focus', 'resilience'], '自分の時間を生きること'),

  makeQuote('rohn-01', 'Either you run the day or the day runs you.', '一日を動かすのは自分か、それとも一日に動かされるかだ。', 'Jim Rohn', 'Jim Rohn', ['focus', 'work'], '一日の主導権を握ること'),
  makeQuote('rohn-02', 'Discipline is the bridge between goals and accomplishment.', '規律は、目標と達成をつなぐ橋だ。', 'Jim Rohn', 'Jim Rohn', ['work', 'focus'], '規律が結果をつなぐこと'),

  makeQuote('seneca-01', 'We suffer more often in imagination than in reality.', '私たちは現実よりも想像の中で苦しむことが多い。', 'Seneca', 'セネカ', ['resilience', 'focus'], '不安を現実と見分けること'),
  makeQuote('seneca-02', 'Difficulties strengthen the mind, as labor does the body.', '労働が体を強くするように、困難は心を強くする。', 'Seneca', 'セネカ', ['resilience', 'health'], '困難が心身を鍛えること'),

  makeQuote('marcus-01', 'You have power over your mind—not outside events. Realize this, and you will find strength.', 'あなたが支配できるのは心であり、外の出来事ではない。それを理解すれば、強さが見つかる。', 'Marcus Aurelius', 'マルクス・アウレリウス', ['focus', 'resilience'], '自分の心に集中すること'),
  makeQuote('marcus-02', 'The happiness of your life depends upon the quality of your thoughts.', '人生の幸福は、思考の質にかかっている。', 'Marcus Aurelius', 'マルクス・アウレリウス', ['focus', 'health'], '思考を整えること'),
];
