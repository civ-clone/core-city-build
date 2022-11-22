import build from './AdditionalData/build';
import { instance as additionalDataRegistryInstance } from '@civ-clone/core-data-object/AdditionalDataRegistry';

additionalDataRegistryInstance.register(...build());
