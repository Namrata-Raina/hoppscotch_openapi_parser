<template>
  
  <div>
    <h1>Testing Bed</h1>
  </div>

  <div>
    <div>
      <h2>Input</h2>
      <textarea v-model="inputvalue"></textarea>
    </div>
    <div>
      <h2>Output</h2>
      <textarea v-model="outputvalue"></textarea>
    </div>
  </div>

  <div>
    <button @click='submit'>Submit</button>
  </div>

</template>

<script>
import Parser from './openAPIParser/Parser';
export default {
  name: 'App',
  components: {
    
  },
  data() {
    return {
      inputvalue:'',
      outputvalue:''
    } 
  },
  methods: {
    submit(){
      this.outputvalue = JSON.stringify(Parser(JSON.parse(this.inputvalue)).parse());
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  margin-top: 60px;
  margin-bottom: 60px;
  margin-right: 60px;
  margin-left: 60px;
  background: #808080;
  height: 600px
}
</style>
