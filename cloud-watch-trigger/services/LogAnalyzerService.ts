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

    const result = await this.askOpenAI(message, stack, featureInfo.url);

    data.analyzeResult = result;

    await this.service.update(data.id, data);
  }

  private async askOpenAI(message: string, stack: string, url: string): Promise<string> {
    const messages: OpenAIChatHistory = [
      {
        role: OPENAI_MESSAGE_ROLES.SYSTEM,
        content: `あなたは${url}のコードベースに精通した熟練ソフトウェアエンジニアです。以下のエラーログを分析し、考えられる原因や解決策について日本語で詳しく説明してください。`,
      },
      {
        role: OPENAI_MESSAGE_ROLES.USER,
        content: `エラーメッセージ:\n\n${message}\n\nスタックトレース:\n\n${stack}\n\n分析と考察を日本語でお願いします。`,
      }
    ];


    if (!this.openAIService) {
      const apiKey = await SecretsManagerUtil.getSecretValue('OpenAI', 'ADMIN');
      this.openAIService = new OpenAIService(apiKey);
    }

    return await this.openAIService.chat(messages, {
      model: OPENAI_MODEL.GPT_5,
      tools: [OpenAIToolName.WEB_SEARCH]
    });
  }
}
