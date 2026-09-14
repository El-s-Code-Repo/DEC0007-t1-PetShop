# Regras de boas práticas

### 1. Fluxo de Trabalho (Branches e Merges)

* **Uma branch, um propósito:** Branches devem ser criadas para resolver ***um único problema por vez***. Se você tem 3 tarefas distintas para fazer, abra uma branch, resolva apenas a primeira tarefa, faça o merge e, em seguida, abra novas branches sucessivamente para as demais.
* **Validação de Impacto:** ***Nunca***, ***em hipótese alguma***, faça alterações direto na main, sempre que for realizar alguma implementação, mudança ou remoção, do projeto, ***utilize uma branch.*** Toda modificação de código deve nascer em uma branch isolada. O merge para a branch `main` só pode ser realizado ***após a verificação*** de que a sua alteração não quebra ou impacta negativamente o código de outro membro da equipe.
* **Autonomia de Escopo:** Você tem total liberdade para realizar alterações nos arquivos dentro da ***sua própria pasta de responsabilidade***, sem precisar da aprovação de terceiros.
* **Comunicação Exigida:** Se você precisar modificar arquivos fora do seu escopo ou fazer alterações drásticas no projeto inteiro, ***é obrigatório conversar com o dono da pasta afetada ou com o grupo todo antes de prosseguir***. 
* **Exceções Simples:** Alterações totalmente inofensivas ***que não afetam a lógica do código*** (como a adição de um comentário ou uma edição de documentação) podem ser mergeadas sem a necessidade de comunicação prévia.  
<br>
---
### 2. Padrões de Nomenclatura

Para manter o histórico legível, todas as branches devem ser escritas em letras **minúsculas** e com as palavras separadas por **hifens** (`-`).

* **Formato das Branches:** `tipo/breve-descricao-da-tarefa`
* **Formato dos Commits:** `tipo: explicação detalhada do que foi feito`  
<br>
---
### 3. Prefixos de Tipos de Alteração

* **feat:** Implementação de uma nova funcionalidade (`feat/criar-tabela-banco`).
* **fix:** Correção de algum bug ou erro no código (`fix/erro-calculo-area`).
* **refactor:** Alteração no código para melhorar a estrutura ou performance, sem alterar o comportamento final para o usuário (`refactor/simplificar-arquitetura`).
* **chore:** Realização de tarefas de manutenção, organização ou configuração (`chore/separar-arquivos-teste`).
* **docs:** Alteração ou adição na documentação do projeto (`docs/atualizar-readme`).
* **test:** Adição ou modificação de testes para validar um pedaço de código (`test/validar-insercao-banco`).