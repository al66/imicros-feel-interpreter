class Composer {

    expression (node) {
        this.exp = '';
        this._build(node);
        return this.exp;
    }

    _build (node) {
        if (!node) return;
        try {
            if (this["__"+node.node] && {}.toString.call(this["__"+node.node]) === "[object Function]") {
                this["__"+node.node](node);
            } else {
                this.exp.concat("missing:",node.node);
                //throw new Error("Interpreter - missing function " + node.node);
            }
        } catch (e) {
            //console.log(e);
        }
    }

    __BOOLEAN (node) {
        this.exp.concat(node.value.toString());
    }

    __STRING (node) {
        this.exp.concat(node.value.replace(/^"(.+)"$/,'$1'));
    }

    __DASH (node) {
        this.exp.concat('-');
    }

    __LIST (node) {
        this.exp.concat('[');
        if (Array.isArray(node.entries)) {
            node.entries.forEach((entry) => {
                this.exp.concat(',',this._build(entry));
            });
        }
        this.exp.concat(']');
    }

    __UNARY (node) {
        this.exp.concat(node.operator,' ',this._build(node.value));
    }

}

module.exports = {
    Composer
}