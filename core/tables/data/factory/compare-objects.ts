export class CompareObjects {
    static generate(...any: any): string {
        let args = [...arguments];

        args = args.map(argument => {
            if (typeof argument === 'object') {
                let ordered = Object.entries(argument);
                ordered = ordered.sort(
                    (e0, e1) => e0[0] > e1[0] ? -1 : 1);
                return ordered;
            } else {
                return argument;
            }
        });

        return JSON.stringify(args);
    }

    static compare(i1: any, i2: any): boolean {
        return this.generate(i1) === this.generate(i2);
    }
}
