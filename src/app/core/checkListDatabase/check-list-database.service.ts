import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TodoItemNode } from 'src/app/app.component';

/**
 * The Json object for to-do list data.
 */
const TREE_DATA: TodoItemNode[] = [
  {
    item: 'Pedro Wesley',
    children: [
      { item: 'Felipe Martins' },
      { item: 'Emanuela Satiro' },
      { item: 'Daniel Gonzales' },
    ],
  },

  {
    item: 'Luis F. Doris',
    children: [
      {
        item: 'Sergio Lopes',
      },
      {
        item: 'Mauro Junior',
      },
      {
        item: 'Maurice Rudolf Ludwig',
        children: [
          {
            item: 'Luis F. Doris',
            children: [
              {
                item: 'Alan G. William',
                children: [
                  {
                    item: 'Joseph E. James A.',
                    children: [{ item: 'Daniel Gonzales' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class CheckListDatabaseService {
  dataChange: BehaviorSubject<TodoItemNode[]> = new BehaviorSubject<
    TodoItemNode[]
  >([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    // Construir os nós da árvore a partir do objeto Json. O resultado é uma lista de `TodoItemNode` com
    // nó do arquivo como children.
    const data = TREE_DATA;

    // Notify the change.
    this.dataChange.next(data);
  }

  //  Construir a árvore de estrutura de arquivos. O `valor` é o objeto Json ou uma subárvore de um objeto Json.
  //  O valor de retorno é a lista de `TodoItemNode`.

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}
