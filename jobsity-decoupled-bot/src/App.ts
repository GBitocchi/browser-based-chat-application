import { Container, ContainerModule } from 'inversify';
import Logger from './utils/Logger';
import * as amqp from 'amqplib';
import * as csv from 'csv-parser';
import * as https from 'https';

export async function App(
  container: Container,
  logger: Logger,
  rabbitHost: string,
  ...modules: ContainerModule[]
) {
  container.load(...modules);

  const rabbitConnection = await amqp.connect(`amqp://${rabbitHost}`);
  const stockChannel = await rabbitConnection.createChannel();

  logger.logInfo(`Connected to RabbitMQ!`);

  const stockRoomRequestQueue = 'stockRoomRequest';
  const stockRoomResponseQueue = 'stockRoomResponse';

  await stockChannel.assertQueue(stockRoomRequestQueue)

  stockChannel.consume(stockRoomRequestQueue, async (stockCodeBuffer) => {
    const stockCode: string = stockCodeBuffer.content.toString();

    stockChannel.ack(stockCodeBuffer);

    await stockChannel.assertQueue(stockRoomResponseQueue)

    const stockResults = [];

    https.get(`https://stooq.com/q/l/?s=${stockCode}&f=sd2t2ohlcv&h&e=csv`, function (stockResponse) {
      stockResponse
        .pipe(csv())
        .on('data', (stockData: any) => stockResults.push(stockData))
        .on('end', () => {
          const closePrice = stockResults[0].Close;
          let stockMessageBot = `There is no close info for Stock Code: ${stockCode.toUpperCase()}`;

          if (closePrice !== 'N/D') {
            stockMessageBot = `${stockCode.toUpperCase()} quote is $${closePrice} per share`
          }

          const stockInfoSent = stockChannel.sendToQueue(stockRoomResponseQueue, Buffer.from(stockMessageBot), {
            contentEncoding: "utf-8",
            contentType: "text/plain"
          })

          if (!stockInfoSent) {
            this._logger.logError(`Could not send stock quote: ${stockCode} to the chat application queue.`);
          }
        });
    });
  })
}