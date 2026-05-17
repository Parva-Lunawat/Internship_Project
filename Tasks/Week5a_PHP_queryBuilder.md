---
---

## Basic query builder (Select style)
- for otherr statements just import func from this and add diff toSql function
- DB Connection using pdo

```php
<?php
/**
 * Basic PDO database connection examples
 * 
 * PDO connections are established using a Data Source Name (DSN)
 * that specifies the database type, location, and connection parameters.
 */

// MySQL connection
try {
    $mysqlDsn = 'mysql:host=localhost;dbname=myapp;charset=utf8mb4';
    $username = 'db_user';
    $password = 'secure_password';
    
    $pdo = new PDO($mysqlDsn, $username, $password);
    echo "Connected to MySQL successfully\n";
} catch (PDOException $e) {
    die("MySQL connection failed: " . $e->getMessage());
}
?>
```
```php
<?php
class QueryBuilder
{
    private $pdo;                           // PHP Data Object: abstraction over databse, easy connection
    private $table;                         
    private $select = ['*'];
    private $where = [];
    private $joins = [];
    private $orderBy = [];
    private $groupBy = [];
    private $having = [];
    private $limit;
    private $offset;
    private $bindings = [];
    
    public function __construct(PDO $pdo)   // constructor class doing DI binding
    {
        $this->pdo = $pdo;
    }
    
    public function table(string $table): self
    {
        $this->table = $table;
        return $this;
    }
    
    public function select(array $columns = ['*']): self
    {
        $this->select = $columns;
        return $this;
    }
    
    public function where(string $column, string $operator, $value): self
    {
        $this->where[] = [
            'column' => $column,
            'operator' => $operator,
            'value' => $value,
            'boolean' => 'AND'
        ];
        return $this;
    }
    
    public function orWhere(string $column, string $operator, $value): self
    {
        $this->where[] = [
            'column' => $column,
            'operator' => $operator,
            'value' => $value,
            'boolean' => 'OR'
        ];
        return $this;
    }
    
    public function join(string $table, string $first, string $operator, string $second): self
    {
        $this->joins[] = [
            'type' => 'INNER',
            'table' => $table,
            'first' => $first,
            'operator' => $operator,
            'second' => $second
        ];
        return $this;
    }
    
    public function leftJoin(string $table, string $first, string $operator, string $second): self
    {
        $this->joins[] = [
            'type' => 'LEFT',
            'table' => $table,
            'first' => $first,
            'operator' => $operator,
            'second' => $second
        ];
        return $this;
    }
    
    public function orderBy(string $column, string $direction = 'ASC'): self
    {
        $this->orderBy[] = ['column' => $column, 'direction' => $direction];
        return $this;
    }
    
    public function groupBy(array $columns): self
    {
        $this->groupBy = array_merge($this->groupBy, $columns);
        return $this;
    }
    
    public function having(string $column, string $operator, $value): self
    {
        $this->having[] = [
            'column' => $column,
            'operator' => $operator,
            'value' => $value
        ];
        return $this;
    }
    
    public function limit(int $limit): self
    {
        $this->limit = $limit;
        return $this;
    }
    
    public function offset(int $offset): self
    {
        $this->offset = $offset;
        return $this;
    }
    
    public function toSql(): string
    {   
        // implode stick array elements as string hence in select if named rows instead of *
        $sql = 'SELECT ' . implode(', ', $this->select);
        $sql .= ' FROM ' . $this->table;
        
        // Add JOINs
        // Iterate over joins[] and concat query
        // no binding here; hence logically correct but wrong
        // but still okay as decided by us which table
        // foreach ($this->joins as $join) {
        //     $sql .= " {$join['type']} JOIN {$join['table']} ON {$join['first']} {$join['operator']} {$join['second']}";
        // }
        $joinClause = [];
        foreach($this->joins as $index => $join) {
            $placeholder = ":join_val_" . $index;
            $this->bindings[$placeholder] = $join['operator'];
            $clause = "{$join['type']} JOIN {$join['table']} ON {$join['first']} {$placeholder} {$join['second']}";
            $joinClause[] = $clause;
        }
        $sql .= implode(' ', $joinClause)
        
        // Add WHERE clauses
        // same here in where 
        // concat where and then loop over conditions
        if (!empty($this->where)) {
            $sql .= ' WHERE ';
            $whereClause = [];
            foreach ($this->where as $index => $condition) {
                $placeholder = ':where_' . $index; // indexing for addition of conditional clauses; style of pdo (mappping)
                // no direct placement of vals in query to avoid sql injection
                // binding makes it all "string"
                $this->bindings[$placeholder] = $condition['value'];
                
                $clause = "{$condition['column']} {$condition['operator']} {$placeholder}";
                
                if ($index > 0) {
                    $clause = "{$condition['boolean']} {$clause}";
                }
                
                $whereClause[] = $clause;
            }
            $sql .= implode(' ', $whereClause);
        }
        
        // Add GROUP BY
        if (!empty($this->groupBy)) {
            $sql .= ' GROUP BY ' . implode(', ', $this->groupBy);
        }
        
        // Add HAVING
        if (!empty($this->having)) {
            $sql .= ' HAVING ';
            $havingClause = [];
            foreach ($this->having as $index => $condition) {
                $placeholder = ':having_' . $index;
                $this->bindings[$placeholder] = $condition['value'];
                $havingClause[] = "{$condition['column']} {$condition['operator']} {$placeholder}";
            }
            $sql .= implode(' AND ', $havingClause);
        }
        
        // Add ORDER BY
        if (!empty($this->orderBy)) {
            $orderClause = [];
            foreach ($this->orderBy as $order) {
                $orderClause[] = "{$order['column']} {$order['direction']}";
            }
            $sql .= ' ORDER BY ' . implode(', ', $orderClause);
        }
        
        // Add LIMIT and OFFSET
        if ($this->limit) {
            $sql .= ' LIMIT ' . $this->limit;
        }
        
        if ($this->offset) {
            $sql .= ' OFFSET ' . $this->offset;
        }
        
        return $sql;
    }
    
    public function getBindings(): array
    {
        return $this->bindings;
    }
    
    public function get(): array
    {
        $stmt = $this->pdo->prepare($this->toSql());
        $stmt->execute($this->getBindings());
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function first(): ?array
    {
        $this->limit(1);
        $results = $this->get();
        return $results[0] ?? null;
    }
    
    public function count(): int
    {
        $originalSelect = $this->select;
        $this->select(['COUNT(*) as count']);
        
        $result = $this->first();
        $this->select = $originalSelect;
        
        return (int) ($result['count'] ?? 0);
    }
    
    public function exists(): bool
    {
        return $this->count() > 0;
    }
}
?>
```