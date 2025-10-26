import * as fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

import OpenAIService from '@common/services/OpenAIService';
import SecretsManagerUtil from '@common/aws/SecretsManagerUtil';
import { BadRequestError } from '@common/errors/index';
import { OpenAIChatHistory } from '@common/interfaces/OpenAIMessageType';

import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';
import { ErrorNotificationService } from '@admin/services/ErrorNotification/ErrorNotificationService';
import { OPENAI_MESSAGE_ROLES, OPENAI_MODEL, OpenAIToolName } from '@common/consts/OpenAIConst';

interface FeatureInfo {
  rootFeature: string;
  url: string;
}

const featureList: FeatureInfo[] = [
  {
    rootFeature: 'Admin',
    url: 'https://github.com/nagiyu/admin',
  },
];

const execAsync = promisify(exec);

export class LogAnalyzerService {
  private service: ErrorNotificationService;
  private openAIService: OpenAIService;

  constructor(service?: ErrorNotificationService, openAIService?: OpenAIService) {
    if (!service) {
      service = new ErrorNotificationService();
    }

    this.service = service;
    this.openAIService = openAIService;
  }

  public async analyzeLog(data: ErrorNotificationDataType): Promise<void> {
    const { rootFeature, message, stack } = data;
    const featureInfo = featureList.find((feature) => feature.rootFeature === rootFeature);

    if (!featureInfo) {
      throw new BadRequestError(`Unknown root feature: ${rootFeature}`);
    }

    const outputFilePath = `/tmp/output-${Date.now()}.json`;
    await execAsync(`repomix --remote ${featureInfo.url} -o ${outputFilePath} --style json --remove-comments`);
    const fileContent = await fs.promises.readFile(outputFilePath, 'utf-8');
    await fs.promises.unlink(outputFilePath);

    const result = await this.askOpenAI(message, stack, fileContent);

    data.analyzeResult = result;

    await this.service.update(data.id, data);
  }

  private async askOpenAI(message: string, stack: string, fileContent: string): Promise<string> {
    const messages: OpenAIChatHistory = [
      {
        role: OPENAI_MESSAGE_ROLES.SYSTEM,
        content: `あなたはログ解析の専門家です。
        分析結果には、エラーの原因、影響範囲、解決策の提案を含めてください。`,
      },
      {
        role: OPENAI_MESSAGE_ROLES.USER,
        content: `エラーメッセージ: ${message}、スタックトレース: ${stack} のログがあります。
        このログの原因、影響範囲、解決策を分析してください。
        プロジェクトのコードベースは以下の通りです: ${fileContent}`,
      }
    ];

    if (!this.openAIService) {
      const apiKey = await SecretsManagerUtil.getSecretValue('OpenAI', 'ADMIN');
      this.openAIService = new OpenAIService(apiKey);
    }

    return await this.openAIService.chat(messages, {
      model: OPENAI_MODEL.GPT_5
    });
  }
}
