import { instance as additionalDataRegistryInstance } from '@civ-clone/core-data-object/AdditionalDataRegistry';
import build from './AdditionalData/build';

additionalDataRegistryInstance.register(...build());
