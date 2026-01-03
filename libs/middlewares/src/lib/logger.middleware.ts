import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getProcessId } from '@common/utils/string.util';
import { MetadataKeys } from '@common/constants/common.constant';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    const startTime = Date.now();
    const { method, originalUrl, params } = req;

    const processId = getProcessId();
    const now = Date.now();

    (req as any)[MetadataKeys.PROCESS_ID] = processId;
    (req as any)[MetadataKeys.START_TIME] = startTime;

    Logger.log(
      `HTTP ==> Start process '${processId}' >> path: '${originalUrl}' at ${now} >> method: '${method}' >> input: ${JSON.stringify(params)}  `,
    );

    const originalSend = res.send.bind(res);
    res.send = (body?: any): Response => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const now = Date.now();
      Logger.log(
        `HTTP <== End process '${processId}' >> path: '${originalUrl}' at ${now} >> method: '${method}' >> duration: ${duration}ms`,
      );
      return originalSend(body);
    };
    next();
  }
}
