/* click em Nova Transação, abre a janela*/ 
const Modal = {
    open(){ // Abrir modal ...  // Adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){ // fechar modal ... // remover a class ative do moal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {/*2º ação*/
        // agora usarsse JSON.parse para voltar de string para array 
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []

    }, /*1º ação*/
    set(transactions){ /* adicionado o JSON.stringify no transactions por que o form é uma array, e precisa ser transformado em string para poder gravar, contdo vem o JSON.*/
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

// Eu preciso somar as entradas
// depois eu preciso somar as saidas
// E remover das entradsa o valor da saídas
// assim, eu terei o total.
const Transaction = { /*responsavel pelo calculo matematico*/
    all: Storage.get(),
    
    add(transaction){
        Transaction.all.push(transaction) /*add uma transação a todas pegando o all:transactions*/

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){ 
        let income = 0;
        // pegar todas as transações
        Transaction.all.forEach( transaction => {
            // para cada transação, se ela for maior que 0 se for maior que zero
            if( transaction.amount > 0){
            // somar a uma variavel e retornar a variavel
            income += transaction.amount;
        }
            
        })
        return income;
    },
    expenses(){ //somar as saídas
        let expenses = 0;
        // pegar todas as transações
        Transaction.all.forEach( transaction => {
            if( transaction.amount < 0){
            expenses += transaction.amount;
        }
            
        })
        return expenses;
    },
    total(){// entrada - sáidas
        return Transaction.incomes() + Transaction.expenses();
    }
}

// Substituir os dados do HTML com os dados do JS
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){ 
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index


     DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index){
        const cssClass = transaction.amount > 0 ? "income" : "expense" /*Para add o css e deixar verde como positivo*/

        /*formataão da moeda*/
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `  
            <td class="descriptions">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="/assets/minus.svg" alt="Remove 
                transações">
            </td>
            `
        return html /*return para fazer com que a constante saia da função,*/
    },

    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())

        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())

        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
        /* add o Utils.formatCurrency para deixar o sifrão*/

    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatDate(date){
        
        const splitteDate = date.split("-") /* retira o - da data*/
        return `${splitteDate[2]}/${splitteDate[1]}/${splitteDate[0]}`
    },
    formatAmount(value){
        value = value * 100
        return Math.round(value)
    },
    formatCurrency(value){

        const signal = Number(value) < 0 ? "-" : ""
        
        /*/\ - fala que vai haver uma spressão regular*/
        /*\D - ache tudo na string que nao for carecter, ( ache só numero*/
        value = String(value).replace(/\D/g, "")

        /*cortar os 0, se for numero quebrado ganha "."*/
        value = Number(value) / 100

        /*transofmrar numero em moeda*/ /*devolve positivo ou negativo*/
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
}
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{ /*retornar o valor dos inputs*/
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

        /* /* /* /* /* /* /* validação dos campos /* /* /* /* /* /* */
    validateFields(){ /* cápturar os valores adicionados no formulario*/
        const { description, amount, date } = Form.getValues()

        /* trim() faz uma limpeza nos campos vazios*/
        /* throw é tipo cospir, lançar, mandar.*/
        if(description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos vazios")
        }

    },

    formatValues(){

        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return{
            description,
            amount,
            date
        }
    },
    
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        /*Foi usado para tirar o evento padrão da DOM do submit.*/
        event.preventDefault()

        try{
            // verificar se todas as informações foram preenchidas
            Form.validateFields()
            
            //formatar os dados para salvarProduto
            const transaction = Form.formatValues()

            // Salvar
            Transaction.add(transaction)

            // apagar os dados inseridos do formulario
            Form.clearFields()

            // e feche o modal
            Modal.close()
            
        } catch (error) { 
            alert(error.message)   

        }
            
    }
}

/* Para finalizar, fazer com que seja gravado algumas informações no storage */
/*pegar as informações get()*/ 
/*guardar informaçãoes set()*/ 


const App = {
    init(){
        
    Transaction.all.forEach((transaction, index) => {
    DOM.addTransaction(transaction, index) /*esta indo para cada funcionalidade e add a transaction */
    })
  
   DOM.updateBalance() /*atualizando cartoes*/

   Storage.set(Transaction.all) /* atualizando os storage*/
    },

    reload(){
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

Transaction.remove(0)
