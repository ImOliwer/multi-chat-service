// interface - representative for unnamed entities
export interface Entity {
  // when this entity was created.
  createdAt: number;
}

// interface - representative for named entities
export interface NamedEntity extends Entity {
  // the name of this entity.
  name: string;
}