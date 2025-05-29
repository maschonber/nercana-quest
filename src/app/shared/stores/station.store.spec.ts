import { TestBed } from '@angular/core/testing';
import { StationStore } from './station.store';
import { ResourceType } from '../../models/station-resources.model';

/**
 * Test suite for Station Store functionality
 */
describe('StationStore', () => {
  let store: InstanceType<typeof StationStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(StationStore);
  });

  afterEach(() => {
    store.resetResources();
  });

  describe('Resource Management', () => {
    it('should start with zero resources', () => {
      expect(store.resources()).toEqual({ goo: 0, metal: 0 });
      expect(store.hasResources()).toBe(false);
      expect(store.totalResources()).toBe(0);
    });

    it('should add goo resources correctly', () => {
      const result = store.addGoo(5, 'Quest reward');

      expect(result.type).toBe(ResourceType.GOO);
      expect(result.amount).toBe(5);
      expect(result.previousAmount).toBe(0);
      expect(result.newAmount).toBe(5);
      expect(result.source).toBe('Quest reward');

      expect(store.resources().goo).toBe(5);
      expect(store.hasResources()).toBe(true);
      expect(store.totalResources()).toBe(5);
    });

    it('should add metal resources correctly', () => {
      const result = store.addMetal(3, 'Salvage operation');

      expect(result.type).toBe(ResourceType.METAL);
      expect(result.amount).toBe(3);
      expect(result.previousAmount).toBe(0);
      expect(result.newAmount).toBe(3);
      expect(result.source).toBe('Salvage operation');

      expect(store.resources().metal).toBe(3);
      expect(store.hasResources()).toBe(true);
      expect(store.totalResources()).toBe(3);
    });

    it('should accumulate multiple resource additions', () => {
      store.addGoo(2, 'First quest');
      store.addGoo(3, 'Second quest');
      store.addMetal(1, 'Combat loot');
      store.addMetal(4, 'Treasure find');

      expect(store.resources()).toEqual({ goo: 5, metal: 5 });
      expect(store.totalResources()).toBe(10);
    });

    it('should spend goo resources when sufficient available', () => {
      store.addGoo(10, 'Initial resources');

      const result = store.spendGoo(3, 'Clone creation');

      expect(result).toBeTruthy();
      expect(result!.type).toBe(ResourceType.GOO);
      expect(result!.amount).toBe(-3);
      expect(result!.previousAmount).toBe(10);
      expect(result!.newAmount).toBe(7);
      expect(result!.source).toBe('Clone creation');

      expect(store.resources().goo).toBe(7);
    });

    it('should spend metal resources when sufficient available', () => {
      store.addMetal(8, 'Initial resources');

      const result = store.spendMetal(2, 'Equipment upgrade');

      expect(result).toBeTruthy();
      expect(result!.type).toBe(ResourceType.METAL);
      expect(result!.amount).toBe(-2);
      expect(result!.previousAmount).toBe(8);
      expect(result!.newAmount).toBe(6);
      expect(result!.source).toBe('Equipment upgrade');

      expect(store.resources().metal).toBe(6);
    });

    it('should return null when trying to spend insufficient goo', () => {
      store.addGoo(2, 'Small amount');

      const result = store.spendGoo(5, 'Expensive operation');

      expect(result).toBeNull();
      expect(store.resources().goo).toBe(2); // Amount unchanged
    });

    it('should return null when trying to spend insufficient metal', () => {
      store.addMetal(1, 'Small amount');

      const result = store.spendMetal(3, 'Expensive operation');

      expect(result).toBeNull();
      expect(store.resources().metal).toBe(1); // Amount unchanged
    });
  });

  describe('Resource Queries', () => {
    beforeEach(() => {
      store.addGoo(7, 'Setup');
      store.addMetal(4, 'Setup');
    });

    it('should get correct resource amounts', () => {
      expect(store.getResourceAmount(ResourceType.GOO)).toBe(7);
      expect(store.getResourceAmount(ResourceType.METAL)).toBe(4);
    });

    it('should check resource sufficiency correctly', () => {
      expect(store.hasEnoughResource(ResourceType.GOO, 5)).toBe(true);
      expect(store.hasEnoughResource(ResourceType.GOO, 7)).toBe(true);
      expect(store.hasEnoughResource(ResourceType.GOO, 8)).toBe(false);

      expect(store.hasEnoughResource(ResourceType.METAL, 3)).toBe(true);
      expect(store.hasEnoughResource(ResourceType.METAL, 4)).toBe(true);
      expect(store.hasEnoughResource(ResourceType.METAL, 5)).toBe(false);
    });
  });

  describe('Resource Operations', () => {
    it('should set resources directly', () => {
      store.setResources(15, 20);

      expect(store.resources()).toEqual({ goo: 15, metal: 20 });
      expect(store.totalResources()).toBe(35);
    });

    it('should prevent negative resource amounts when setting', () => {
      store.setResources(-5, -10);

      expect(store.resources()).toEqual({ goo: 0, metal: 0 });
    });

    it('should reset all resources to zero', () => {
      store.addGoo(10, 'Test');
      store.addMetal(5, 'Test');

      store.resetResources();

      expect(store.resources()).toEqual({ goo: 0, metal: 0 });
      expect(store.hasResources()).toBe(false);
      expect(store.totalResources()).toBe(0);
    });

    it('should prevent negative resource amounts when adding', () => {
      store.addGoo(5, 'Initial');
      const result = store.addGoo(-10, 'Negative amount');

      expect(result.newAmount).toBe(0);
      expect(store.resources().goo).toBe(0);
    });
  });
});
