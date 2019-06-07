# D3IE-Italy

A graphical tool based on D3.js to visualize incomes and expenses of italian families over time. 
This tool has been developed using HTML, CSS and JavaScript. 
Data have been analyzed and prepared using Python, with the help of Pandas and NumPy libraries.

This project was developed during the course of Scientific and large data visualization, 
which is part of the master degree in Computer Science at University of Pisa.

The whole work was done under the supervision of professors Paolo Cignoni and Daniela Giorgi, from ISTI-CNR in Pisa. 

<hr>

You can test D3IE-Italy here: https://mloporchio.github.io/D3IE-Italy.

A brief guide on how to use this tool is also available here (in Italian): https://mloporchio.github.io/D3IE-Italy/guide

<hr>

If you found a bug, or if you have any kind of question about the project, please let me know at: 
<code>
  m dot loporchio at studenti dot unipi dot it
</code>

---

# 🇮🇹 D3IE-Italy 
## A brief how-to guide

### Introduction

D3IE-Italy has been developed by Matteo Loporchio, a Computer Science student at University of Pisa. This project was born during the course of Scientific and Large Data visualization, under the supervision of professors Paolo Cignoni and Daniela Giorgi, from ISTI-CNR in Pisa.

D3IE-Italy is an interactive map whose aim is to show how incomes and expenses
of italian families have evolved from 1997 to 2017. Every value you see has been computed as a monthly average for each family.

Data concerning incomes have been processed starting from the <strong>Indagine sui bilanci delle famiglie italiane</strong>, Banca d'Italia. 
On the other hand, information about expenses has been extracted from the <strong>Indagine sulle spese delle famiglie</strong>, conducted by Istat since 2014. For years preceding 2014, data have been collected from the analogous <strong>Indagine sui consumi delle famiglie</strong>, also conducted by Istat.

Family expenses are divided into 12 categories, according to the classification made by Istat. Users may either select each category to know its evolution or 
display the total expense in order to check it against the income variation over time. Beside expenses, users may also focus on a given year or region.

The main screen of D3IE-Italy is made up by three frames:

1. The map of Italy.
2. The incomes and expenses graph.
3. The category selection frame.

We will now briefly present how they work.

<hr>

### Category selection

<img style="float: left;" src="select.png" width="40%" hspace="10" vspace="10">

The rightmost frame allows the user to select the expense category to be shown.
To ease the distinction, each category has a color. When changing category, the map and the graph will be modified accordingly, in order to display the evolution in space and time, respectively.

<div style="clear: left;">

<hr>

### Map

<img style="float: left;" src="map.png" width="40%" hspace="10" vspace="10">

The leftmost frame contains a map of Italy which is colored according to the currently selected category and the current year. The legend below the map gives an idea of the range of values. 
By hovering the mouse over a single region it is possible to see the amount of Euros for the currently selected category. By clicking over the region, the focus will shift on regional data and the graph will be modified accordingly.

Changing the view mode is also possible: you may switch from single region visualization to Istat macro-region categorization, with a click on the button below the map title. Even in this case data will be updated to show aggregated expenses.

<div style="clear: left;">

<hr>

### Graph

<img style="float: left;" src="./graph1.png" width="40%" hspace="10" vspace="10">

The main goal of the graph is to show the variation of expenses and income across the years. Expense categories are identified by their color and
are represented as stacked bands, just like in a classical stacked area graph.
The larger the width of the bands, the greater the amount of Euros for that category will be. The width is - of course - variable over time and each band
may either shrink or enlarge itself when decreasing or increasing.

The Y axis is labeled with a scale which may be useful to compare income and total expense. The latter may be deduced by considering the stack
made up by all the categories, because the value reached by the uppermost band corresponds exactly to the sum of all expenses (by construction). 
On the other hand,
the yellow line highlights the evolution of income as it would do in a classical cartesian graph.

<div style="clear: left;">

<img style="float: right;" src="./graph2.png" width="40%" hspace="10" vspace="10">

By hovering the mouse over it, a band is highlighted to ease the visualization. If a user clicks over it, the graph will be transformed and the evolution of
that category will be displayed in detail, as shown in the figure on the right.
In this case, the expense variation can be simply inferred from the profile 
of the shape.

By dragging the range slider under the graph, 
the user can change the currently displayed year. This change is reflected both on the graph, where a red vertical bar moves according to the current date, and on the map, which is recolored according to the new information.

