import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { Observable, of as ofObservable } from 'rxjs';
import { CheckListDatabaseService } from './core/checkListDatabase/check-list-database.service';

/**
 * Nó para to-do item
 */
export class TodoItemNode {
  children?: TodoItemNode[];
  item: string;
}

/** Nó de item de tarefas simples com informações expansíveis e de nível */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * O objeto Json para dados da lista de tarefas.
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
];
/**
 * Checklist database, ele pode construir um objeto Json estruturado em árvore.
 * Cada nó no objeto Json representa um item de tarefa ou uma categoria.
 * Se um nó for uma categoria, ele terá itens filhos e novos itens podem ser adicionados à categoria.
 */

/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
})
export class AppComponent {
  /** Mapeamento de um nó simples para um nó aninhado. Isso ajudará a encontrar o nó aninhado a ser modificado */
  flatNodeMap: Map<TodoItemFlatNode, TodoItemNode> = new Map<
    TodoItemFlatNode,
    TodoItemNode
  >();

  /** Mapeamento de nó aninhado a nó com os flat item . Isso nos ajuda a manter o objeto para seleção */
  nestedNodeMap: Map<TodoItemNode, TodoItemFlatNode> = new Map<
    TodoItemNode,
    TodoItemFlatNode
  >();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** Seleção para checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(
    true /* multiple */
  );

  constructor(private database: CheckListDatabaseService) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    database.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  getLevel = (node: TodoItemFlatNode) => {
    return node.level;
  };

  isExpandable = (node: TodoItemFlatNode) => {
    return node.expandable;
  };

  getChildren = (node: TodoItemNode): Observable<TodoItemNode[]> => {
    return ofObservable(node.children);
  };

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => {
    return _nodeData.expandable;
  };

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => {
    return _nodeData.item === '';
  };

  transformer = (node: TodoItemNode, level: number) => {
    let flatNode =
      this.nestedNodeMap.has(node) &&
      this.nestedNodeMap.get(node)!.item === node.item
        ? this.nestedNodeMap.get(node)!
        : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Se todos os descendentes do nó são selecionados */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every((child) =>
      this.checklistSelection.isSelected(child)
    );
  }

  /** Se parte dos descendentes são selecionados */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  /** Alternar a seleção de itens pendentes. Selecione / desmarque todos os nós descendentes */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  /** Salvar o nó */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode!, itemValue);
  }
}

/**  Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */
