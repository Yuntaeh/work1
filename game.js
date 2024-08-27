import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    this.hp = 100;
    this.maxHp = 100;
    this.Attack = 20;
    this.maxAttackdamage = 3;
    this.heal = 20;
    this.runChance = 30;
    this.defence = 3;
    this.criticalAttack = 20; // 크리티컬 확률
    this.criticalPersent = 2; // 크리티컬 배수
  }

  // 플레이어 공격
  attack() {
    const baseDamage = Math.floor(Math.random() * (this.Attack * this.maxAttackdamage));
    const critical = Math.random() * 100 < this.criticalAttack;
    const damage = critical ? Math.floor(baseDamage * this.criticalPersent) : baseDamage;

    if (critical) {
      return {
        damage,
        message: chalk.green(`크리티컬 히트! ${damage}의 피해를 입혔습니다!`),
      };
    } else {
      return {
        damage,
        message: chalk.green(`${damage}의 피해를 입혔습니다!`),
      };
    }
  }

  // 방어력 비례 데미지 감소
  defDamage(damage) {
    const defenceDamage = Math.max(0, damage - this.defence);
    this.hp -= defenceDamage;
    return defenceDamage;
  }

  // 플레이어 힐
  healPlayer() {
    this.hp = Math.min(this.hp + this.heal, this.maxHp);
    console.log(chalk.green(`플레이어가 ${this.heal}만큼 회복했습니다.`));
  }

  // 스탯 증가
  increaseStats() {
    const statsIncrease = Math.floor(Math.random() * 5) + 1; // 1에서 5의 랜덤값
    const statChoice = Math.floor(Math.random() * 3); // 0:hp 1:attack 2:defence

    if (statChoice === 0) {
      this.maxHp += statsIncrease;
      this.hp += statsIncrease;
      console.log(chalk.yellow(`최대 체력이 ${statsIncrease}만큼 증가했습니다!`));
    } else if (statChoice === 1) {
      this.Attack += statsIncrease;
      console.log(chalk.yellow(`공격력이 ${statsIncrease}만큼 증가했습니다!`));
    } else if (statChoice === 2) {
      this.defence += statsIncrease;
      console.log(chalk.yellow(`방어력이 ${statsIncrease}만큼 증가했습니다!`));
    }
  }

  defend() {
    this.defence *= 2;
    console.log(chalk.blue(`플레이어가 방어 태세에 들어갑니다! 방어력 2배 증가!`))
  }

  resetDefence() {
    this.defence /= 2;
  }
}

class Monster {
  constructor(stage) {
    this.hp = 100 + stage * 5;
    this.monsAttack = 10 + stage * 2;
  }

  attack() {
    return Math.floor(Math.random() * this.monsAttack);
  }

  hitDamage(damage) {
    this.hp -= damage;
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어 정보 HP:${player.hp}/${player.maxHp} ATK:${player.Attack} DEF:${player.defence}`,
    ) +
    chalk.redBright(
      `| 몬스터 정보 HP:${monster.hp} ATK:${monster.monsAttack} |`,
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));

}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 아무것도 하지않는다. 3. 도망간다 4.방어한다.`,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    // logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    if (choice === '1') {
      const playerAttack = player.attack();
      monster.hitDamage(playerAttack.damage);
      logs.push(playerAttack.message);
      // await new Promise ((resolve) => setTimeout(resolve, 1500))
      // 플레이어 공격

      if (monster.hp > 0) {
        const monsterDamage = monster.attack();
        const defDamage = player.defDamage(monsterDamage);
        logs.push(chalk.red(`몬스터가 ${defDamage}의 피해를 입혔습니다!`));
        // await new Promise ((resolve) => setTimeout(resolve, 1500))
        // 몬스터 공격
      }

    } else if (choice === '2') {
      logs.push(chalk.yellow(`플레이어가 상대를 살펴봅니다.`));
      const monsterDamage = monster.attack();
      const defDamage = player.defDamage(monsterDamage);
      logs.push(chalk.red(`몬스터가 ${defDamage}의 피해를 입혔습니다!`));
      // 살펴보기

    } else if (choice === '3') {
      if (Math.random() * 100 < player.runChance) {
        logs.push(chalk.yellow(`도망에 성공하셨습니다!`));
        return;
      } else {
        logs.push(chalk.red(`도망에 실패하셨습니다!`));
        const monsterDamage = monster.attack();
        const defDamage = player.defDamage(monsterDamage);
        logs.push(chalk.red(`몬스터가 ${defDamage}의 피해를 입혔습니다!`));
        // 도망치기
      }
    } else if (choice === '4') {
      player.defend();
      if (monster.hp > 0) {
        const monsterDamage = monster.attack();
        const defDamage = player.defDamage(monsterDamage);
        logs.push(chalk.red(`몬스터가 ${defDamage}의 피해를 입혔습니다!`))
      }
      player.resetDefence();
      // 방어하기, 방어력 초기화
    }

    displayStatus(stage, player, monster);

    // 종료 조건
    if (player.hp <= 0) {
      console.clear();
      console.log(chalk.red(`플레이어가 패배했습니다! 게임 종료.`));
      return;
    } else if (monster.hp <= 0) {
      console.clear();
      console.log(chalk.green(`Stage ${stage} Clear! Congraturation!`));
      return;
    }
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 100 && player.hp > 0) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    if (player.hp <= 0) {
      console.log(chalk.red(`Game Over. You lose.`));
      break;
    } else {
      console.log(chalk.green(`${stage} Stage Clear!`));

      player.healPlayer();  // 스테이지 클리어 후 회복
      player.increaseStats(); // 스테이지 클리어 후 랜덤 스탯 증가

      await new Promise((resolve) => setTimeout(resolve,1500));
      // 스테이지 클리어 로그 1.5초 동안 띄우고 넘어가기

      stage++;
      console.clear();
    }
  }

  if (player.hp > 0) {
    console.log(chalk.green(`축하합니다! 모든 스테이지를 클리어하셨습니다!`));
  }
}