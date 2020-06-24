<template>
    <div style="padding:30px">
        <div v-for='template in templates' v-bind:key='template'>
            <h5 class="center">{{ template }} Reports</h5><br>
            <div style = 'display:flex;flex-direction:row;justify-content:space-around;'>
                <div class='column'>
                    <div class='header center'>Name</div><hr>
                    <div v-for='data in dataS[template]' class="center">
                        {{data.name}}
                    </div>
                </div>
                <div class='column'>
                    <div class='header center'>Class</div><hr>
                    <div v-for='data in dataS[template]' class="center">
                    {{data.class}}
                    </div>
                </div>
                <div v-for='templateField in templateHeader[template]' v-bind:key="templateField">
                    <div class='header center'>{{ templateField }}</div><hr>
                    <div v-for='data in dataS[template]' class="center">
                     {{ data[templateField] }}
                    </div><br><br>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import '../assets/scss/reports_test.scss'
// When importing data 1) where email = student 2) append type if not there in templates 3) append fields to template header
    export default {
        data() {
            return {
                templates: ['Photography','Theatre'],
                templateHeader: {'Photography':['Creativity','Detail','Composition'],'Theatre':['Scripting','Direction','Whatnot','Yesnot']},
                dataS: {'Photography':[{'name':'A','Creativity':10,'class':'Sendombalik Dicatorus','Detail':3,'Composition':7},
                        {'name':'B','Creativity':10,'class':'LS','Detail':4,'Composition':7}],
                        'Theatre':[{'name':'Alabamakazama','Whatnot':10,'class':'Senior Debate','Scripting':3,'Direction':7,'Yesnot':69}]}
            }
        }
    }
</script>