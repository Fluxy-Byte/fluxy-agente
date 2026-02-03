import 'dotenv/config'
import routes from "./src/routes/route";
import { connectRabbit } from "./src/config/infra/rabbitmg";
import { startTaskWorkerCampaign } from './src/services/workers/task.worker.campaign';
import { startTaskWorkerReceptive } from './src/services/workers/task.worker.receptive';
import { connectMongo } from './src/config/database/conectionMongo';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectRabbit();
    await startTaskWorkerCampaign();
    await startTaskWorkerReceptive();
    await connectMongo();
  } catch (e) {
    console.log(e)
  } finally {
    routes.listen(PORT, () => {
      console.log(`🚀 API rodando na porta http://localhost:${PORT}`);
      console.log(`📚 Swagger em http://localhost:${PORT}/api/v1/docs`);
    });
  }
}

start()

